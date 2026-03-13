-- Import SwingCity training modules for Spirits venue, Golf category
-- This script adds the training modules from the SwingCity system

-- Note: You'll need to run this as an admin user or update the createdBy IDs
-- Replace 'ADMIN_USER_ID' with an actual admin user ID from your users table

-- Module 1: Dashboard Overview
INSERT INTO training_courses (title, description, "videoUrl", content, "quizQuestions", site, category, "moduleType", duration, active, "createdAt", "updatedAt")
VALUES (
  'Dashboard Overview',
  'This video provides a comprehensive overview of the SwingCity Dashboard and its key features for staff members.',
  'QKmFzc5dgVk',
  '<p>This video provides a comprehensive overview of the SwingCity Dashboard and its key features for staff members.</p><p><strong>What you''ll learn:</strong></p><ul><li>Navigating the main dashboard interface</li><li>Understanding the different sections and their purposes</li><li>Accessing key features like Teams, Leaderboard, and High Scores</li><li>Basic navigation and getting started with the system</li></ul><p><strong>Dashboard Sections:</strong></p><ul><li><strong>Teams:</strong> Create and manage player teams</li><li><strong>Leaderboard:</strong> Live scores and rankings display</li><li><strong>High Scores:</strong> All-time best performances</li><li><strong>Podium:</strong> Winner celebration display</li><li><strong>App Install:</strong> Download tablet app updates</li><li><strong>Training:</strong> This training centre</li></ul>',
  '[
    {
      "question": "What is the main purpose of the SwingCity Dashboard?",
      "options": [
        "To play games",
        "To manage the venue and teams",
        "To watch videos",
        "To check emails"
      ],
      "correctAnswer": 1
    },
    {
      "question": "Which section allows you to create and manage player teams?",
      "options": [
        "Leaderboard",
        "High Scores",
        "Teams",
        "Training"
      ],
      "correctAnswer": 2
    },
    {
      "question": "What does the Leaderboard display?",
      "options": [
        "All-time best scores",
        "Both live scores for active teams and all-time best scores",
        "Team management",
        "App downloads"
      ],
      "correctAnswer": 1
    }
  ]'::jsonb,
  'Spirits',
  'Golf',
  'video',
  3,
  true,
  NOW(),
  NOW()
);

-- Module 2: Hosting a Booking
INSERT INTO training_courses (title, description, "videoUrl", content, "quizQuestions", site, category, "moduleType", duration, active, "createdAt", "updatedAt")
VALUES (
  'Hosting a Booking',
  'This video demonstrates how to host a booking and show customers how the SwingCity system works.',
  '_PMBBdwD6BU',
  '<p>This video demonstrates how to host a booking and show customers how the SwingCity system works.</p><p><strong>What you''ll learn:</strong></p><ul><li>How to guide customers through the booking process</li><li>Demonstrating the system features to new players</li><li>Key points to explain during a booking</li><li>Best practices for hosting and customer interaction</li></ul><p><strong>Hosting Tips:</strong></p><ul><li>Be friendly and welcoming to create a positive experience</li><li>Explain the system clearly and answer any questions</li><li>Show customers how to use RFID cards and navigate the course</li><li>Ensure they understand the scoring system and how to view their progress</li></ul>',
  '[
    {
      "question": "What is the main purpose of hosting a booking?",
      "options": [
        "To play the game yourself",
        "To demonstrate the system and guide customers",
        "To fix technical issues",
        "To update the software"
      ],
      "correctAnswer": 1
    },
    {
      "question": "What should you explain to customers during a booking?",
      "options": [
        "Only the scoring system",
        "How to use RFID cards, navigate the holes, and view progress",
        "The rules of crazy golf",
        "Nothing - let them figure it out"
      ],
      "correctAnswer": 1
    },
    {
      "question": "What is important when hosting a booking?",
      "options": [
        "Be quiet and let customers explore alone",
        "Be friendly, explain clearly, and answer questions",
        "Rush through the explanation quickly",
        "Show how the sensors work"
      ],
      "correctAnswer": 1
    }
  ]'::jsonb,
  'Spirits',
  'Golf',
  'video',
  2,
  true,
  NOW(),
  NOW()
);

-- Module 3: Sensor Location
INSERT INTO training_courses (title, description, "videoUrl", content, "quizQuestions", site, category, "moduleType", duration, active, "createdAt", "updatedAt")
VALUES (
  'Sensor Location',
  'This video provides a comprehensive guide on locating sensors throughout the SwingCity course and how to replace them when needed.',
  'JXdsVZlco3w',
  '<p>This video provides a comprehensive guide on locating sensors throughout the SwingCity course and how to replace them when needed.</p><p><strong>What you''ll learn:</strong></p><ul><li>How to identify sensor locations on each hole</li><li>Tools and equipment needed for sensor maintenance</li></ul><p><strong>Key Points:</strong></p><ul><li>How to quickly locate sensors on each hole</li></ul><p><strong>Important Notes:</strong></p><ul><li>Document sensor locations for future reference</li><li>Test sensors thoroughly after replacement</li><li>Keep spare sensors on hand for quick replacements</li></ul>',
  '[
    {
      "question": "Where can you find the 100 sensor for Plinko?",
      "options": [
        "Just unscrew the cover of the hole",
        "Take off every shurikan and throw them at the sensor",
        "Open the hatch next to the front door",
        "Underneath the tablet"
      ],
      "correctAnswer": 2
    },
    {
      "question": "What should you do before replacing a sensor?",
      "options": [
        "Test the sensor first",
        "Power down the system",
        "Call technical support",
        "Nothing - just replace it"
      ],
      "correctAnswer": 0
    },
    {
      "question": "Where can you find the sensors for Octagon?",
      "options": [
        "Jump down the behind the hole",
        "To quickly locate and replace faulty sensors when needed",
        "By putting a ball through the pipe and looking through the other end",
        "By sliding out the inner octagon then lifting it up"
      ],
      "correctAnswer": 3
    },
    {
      "question": "What should you do after replacing a sensor?",
      "options": [
        "Leave it and hope it works",
        "Test the sensor to verify it is working correctly",
        "Replace all other sensors too",
        "Restart the entire system"
      ],
      "correctAnswer": 1
    }
  ]'::jsonb,
  'Spirits',
  'Golf',
  'video',
  4,
  true,
  NOW(),
  NOW()
);

-- Module 4: System Shutdown
INSERT INTO training_courses (title, description, "videoUrl", content, "quizQuestions", site, category, "moduleType", duration, active, "createdAt", "updatedAt")
VALUES (
  'System Shutdown',
  'This video provides a comprehensive guide on how to shut down the golf system.',
  'V2zgrb_SwGQ',
  '<p>This video provides a comprehensive guide on how to shut down the golf system.</p><p><strong>What you''ll learn:</strong></p><ul><li>How to safely shut down the system</li><li>Proper shutdown procedures and sequence</li></ul><p><strong>Key Points:</strong></p><ul><li>Follow the correct shutdown sequence to prevent data loss</li><li>Ensure all active sessions are properly closed</li></ul><p><strong>Important Notes:</strong></p><ul><li>Always follow the proper shutdown procedure</li><li>Wait for confirmation before powering off equipment</li><li>Ensure the bar closedown is complete before the system shut down</li></ul>',
  '[
    {
      "question": "How do you shut down the tablet on ski-jump?",
      "options": [
        "Just press and hold the power button",
        "Tap the power button",
        "Press and hold the power button and then confirm it on the screen.",
        "It does not need to be shut down"
      ],
      "correctAnswer": 2
    },
    {
      "question": "How do you close down the host laptop?",
      "options": [
        "Just close the laptop",
        "Close down all apps appropriate then shut down the laptop",
        "Smack it with a golf club",
        "The close down fairies will do it for you"
      ],
      "correctAnswer": 1
    },
    {
      "question": "Why is it important to follow the shutdown procedure?",
      "options": [
        "To save time",
        "To prevent system errors",
        "To test the system",
        "It is not important"
      ],
      "correctAnswer": 1
    },
    {
      "question": "What should you do first in the shutdown procedure?",
      "options": [
        "Flick the fuses",
        "Why am I shutting them down? I told you, the fairies will do it!",
        "Shut down the tablets one by one",
        "Ignore the shutdown process"
      ],
      "correctAnswer": 2
    }
  ]'::jsonb,
  'Spirits',
  'Golf',
  'video',
  2,
  true,
  NOW(),
  NOW()
);
