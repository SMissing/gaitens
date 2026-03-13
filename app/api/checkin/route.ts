import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { createServerClient } from '@/lib/db'

// Helper function to award streak achievement badge
async function awardStreakAchievement(userId: string, streakCount: number) {
  const supabase = createServerClient()
  
  // Define milestone achievements
  const milestones = [
    { name: '1-Day Streak', days: 1 },
    { name: '7-Day Streak', days: 7 },
    { name: '30-Day Streak', days: 30 },
    { name: '100-Day Streak', days: 100 },
  ]

  // Check if user reached any milestone
  for (const milestone of milestones) {
    if (streakCount === milestone.days) {
      // Get the achievement ID
      const { data: achievement, error: achievementError } = await supabase
        .from('achievements')
        .select('id')
        .eq('name', milestone.name)
        .maybeSingle()

      if (achievementError) {
        console.error(`Error fetching achievement "${milestone.name}":`, achievementError)
        continue // Skip this milestone if achievement doesn't exist
      }

      if (achievement) {
        // Check if user already has this achievement
        const { data: existing, error: existingError } = await supabase
          .from('user_achievements')
          .select('id')
          .eq('userId', userId)
          .eq('achievementId', achievement.id)
          .maybeSingle()

        if (existingError && existingError.code !== 'PGRST116') {
          console.error('Error checking existing achievement:', existingError)
          continue // Skip if there's a real error
        }

        if (!existing) {
          // Award the achievement (system-awarded, use default system user UUID)
          const SYSTEM_USER_ID = '0e3adb82-0f7a-4a0c-b39c-11029d6ddb07' // System user for auto-awarded achievements
          
          const { error: insertError } = await supabase
            .from('user_achievements')
            .insert({
              userId,
              achievementId: achievement.id,
              currentProgress: milestone.days,
              completed: true,
              awardedBy: SYSTEM_USER_ID, // Use system user ID for system-awarded achievements
            })

          if (insertError) {
            console.error('Error awarding achievement:', insertError)
            continue // Skip notification if insert failed
          }

          // Send push notification
          try {
            const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
            await fetch(`${baseUrl}/api/push/send`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId,
                title: milestone.days === 1 
                  ? 'Welcome! 🎉' 
                  : 'Streak Achievement Unlocked! 🔥',
                body: milestone.days === 1
                  ? 'Welcome to daily check-ins! Keep checking in daily to unlock more badges!'
                  : `Congratulations! You've reached a ${milestone.days}-day check-in streak!`,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/icon-72x72.png',
                tag: 'streak-achievement',
                data: {
                  url: '/achievements',
                  type: 'achievement',
                  achievementName: milestone.name,
                },
                internalSecret: process.env.INTERNAL_API_SECRET || 'internal-secret-change-in-production',
              }),
            }).catch(err => {
              console.error('Failed to send push notification:', err)
            })
          } catch (error) {
            console.error('Error sending push notification:', error)
          }
        }
      }
    }
  }
}

// POST - Record a daily check-in
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDate = today.toISOString().split('T')[0]

    // Check if user already checked in today
    const { data: existingCheckIn } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('userId', user.id)
      .eq('checkInDate', todayDate)
      .single()

    if (existingCheckIn) {
      // Already checked in today, return current streak info
      const { data: streak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('userId', user.id)
        .single()

      return NextResponse.json({
        alreadyCheckedIn: true,
        currentStreak: streak?.currentStreak || 0,
        longestStreak: streak?.longestStreak || 0,
      })
    }

    // Get or create user streak record
    let { data: streak, error: streakError } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('userId', user.id)
      .single()

    if (streakError && streakError.code === 'PGRST116') {
      // No streak record exists, create one
      const { data: newStreak, error: createError } = await supabase
        .from('user_streaks')
        .insert({
          userId: user.id,
          currentStreak: 0,
          longestStreak: 0,
          lastCheckInDate: null,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating streak record:', createError)
        return NextResponse.json(
          { error: 'Failed to create streak record' },
          { status: 500 }
        )
      }

      streak = newStreak
    } else if (streakError) {
      console.error('Error fetching streak:', streakError)
      return NextResponse.json(
        { error: 'Failed to fetch streak' },
        { status: 500 }
      )
    }

    // Calculate new streak
    let newStreak = 1
    if (streak?.lastCheckInDate) {
      const lastCheckIn = new Date(streak.lastCheckInDate)
      lastCheckIn.setHours(0, 0, 0, 0)
      
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      // Check if last check-in was yesterday (maintains streak)
      if (lastCheckIn.getTime() === yesterday.getTime()) {
        newStreak = (streak.currentStreak || 0) + 1
      } else if (lastCheckIn.getTime() === today.getTime()) {
        // Already checked in today (shouldn't happen, but handle it)
        return NextResponse.json({
          alreadyCheckedIn: true,
          currentStreak: streak.currentStreak || 0,
          longestStreak: streak.longestStreak || 0,
        })
      }
      // If last check-in was more than 1 day ago, streak resets to 1
    }

    // Update longest streak if needed
    const newLongestStreak = Math.max(newStreak, streak?.longestStreak || 0)

    // Insert check-in record
    const { error: checkInError } = await supabase
      .from('daily_checkins')
      .insert({
        userId: user.id,
        checkInDate: todayDate,
      })

    if (checkInError) {
      console.error('Error inserting check-in:', checkInError)
      return NextResponse.json(
        { error: 'Failed to record check-in' },
        { status: 500 }
      )
    }

    // Update streak record
    const { error: updateError } = await supabase
      .from('user_streaks')
      .update({
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckInDate: todayDate,
        updatedAt: new Date().toISOString(),
      })
      .eq('userId', user.id)

    if (updateError) {
      console.error('Error updating streak:', updateError)
      return NextResponse.json(
        { error: 'Failed to update streak' },
        { status: 500 }
      )
    }

    // Check if user reached a milestone and award badge
    await awardStreakAchievement(user.id, newStreak)

    return NextResponse.json({
      success: true,
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      checkedInToday: true,
    })
  } catch (error) {
    console.error('Error in POST /api/checkin:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

// GET - Get current streak information
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const supabase = createServerClient()

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayDate = today.toISOString().split('T')[0]

    // Check if user already checked in today
    const { data: checkedInToday } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('userId', user.id)
      .eq('checkInDate', todayDate)
      .maybeSingle()

    // Get streak information
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('userId', user.id)
      .maybeSingle()

    return NextResponse.json({
      checkedInToday: !!checkedInToday,
      currentStreak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      lastCheckInDate: streak?.lastCheckInDate || null,
    })
  } catch (error) {
    console.error('Error in GET /api/checkin:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}
