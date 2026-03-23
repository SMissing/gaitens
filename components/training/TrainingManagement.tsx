'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Loader2, Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import type { TrainingCourse } from '@/types/database'

export function TrainingManagement() {
  const [courses, setCourses] = useState<Array<TrainingCourse & { users?: { name: string } }>>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [sites, setSites] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    content: '',
    site: '',
    requiredScope: 'none' as 'none' | 'site' | 'all',
    category: '',
    moduleType: 'video' as 'video' | 'text' | 'guide',
    duration: '',
    quizQuestions: [] as Array<{ question: string; options: string[]; correctAnswer: number }>,
  })

  useEffect(() => {
    fetchCourses()
    fetchSites()
  }, [])

  const fetchSites = async () => {
    try {
      const response = await fetch('/api/staff?active=true')
      if (response.ok) {
        const staff = await response.json()
        const uniqueSites = Array.from(new Set(staff.map((s: any) => s.site).filter(Boolean)))
        setSites(uniqueSites as string[])
      }
    } catch (error) {
      console.error('Error fetching sites:', error)
    }
  }

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/training?all=true')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCourse ? `/api/training/${editingCourse}` : '/api/training'
      const method = editingCourse ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        site: formData.site || null,
        category: formData.category || null,
        requiredScope: formData.requiredScope,
        quizQuestions: formData.quizQuestions.length > 0 ? formData.quizQuestions : [],
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Failed to save training module')
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        content: '',
        site: '',
        requiredScope: 'none',
        category: '',
        moduleType: 'video',
        duration: '',
        quizQuestions: [],
      })
      setShowForm(false)
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      console.error('Error saving course:', error)
      alert('Failed to save training module')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (course: TrainingCourse) => {
    setFormData({
      title: course.title,
      description: course.description || '',
      videoUrl: course.videoUrl || '',
      content: course.content || '',
      site: course.site || '',
      requiredScope: (course as any).requiredScope || 'none',
      category: course.category || '',
      moduleType: course.moduleType,
      duration: course.duration?.toString() || '',
      quizQuestions: course.quizQuestions || [],
    })
    setEditingCourse(course.id)
    setShowForm(true)
  }

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this training module?')) return

    try {
      const response = await fetch(`/api/training/${courseId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchCourses()
      }
    } catch (error) {
      console.error('Error deleting course:', error)
    }
  }

  const addQuizQuestion = () => {
    setFormData({
      ...formData,
      quizQuestions: [
        ...formData.quizQuestions,
        { question: '', options: ['', '', '', ''], correctAnswer: 0 },
      ],
    })
  }

  const updateQuizQuestion = (index: number, field: string, value: any) => {
    const updated = [...formData.quizQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setFormData({ ...formData, quizQuestions: updated })
  }

  const removeQuizQuestion = (index: number) => {
    setFormData({
      ...formData,
      quizQuestions: formData.quizQuestions.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Training Modules</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Module
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCourse ? 'Edit' : 'Create'} Training Module</CardTitle>
            <CardDescription>
              {editingCourse ? 'Update the training module details' : 'Create a new training module for staff'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moduleType">Module Type *</Label>
                  <Select
                    id="moduleType"
                    options={[
                      { value: 'video', label: 'Video' },
                      { value: 'text', label: 'Text' },
                      { value: 'guide', label: 'Guide' },
                    ]}
                    value={formData.moduleType}
                    onChange={(value) => setFormData({ ...formData, moduleType: value as any })}
                    placeholder="Select type"
                  />
                </div>

                <div>
                  <Label htmlFor="site">Site (optional, leave empty for all sites)</Label>
                  <Select
                    id="site"
                    options={[
                      { value: '', label: 'All Sites' },
                      ...sites.map(site => ({ value: site, label: site })),
                    ]}
                    value={formData.site}
                    onChange={(value) => {
                      setFormData({ ...formData, site: value, category: '' }) // Clear category when site changes
                    }}
                    placeholder="All Sites"
                  />

                  <div className="mt-4">
                    <Label htmlFor="requiredScope">Mandatory</Label>
                    <Select
                      id="requiredScope"
                      options={[
                        { value: 'none', label: 'Not required' },
                        { value: 'site', label: 'Required for matching site only' },
                        { value: 'all', label: 'Required for all sites' },
                      ]}
                      value={formData.requiredScope}
                      onChange={(value) => setFormData({ ...formData, requiredScope: value as any })}
                      placeholder="Required scope"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="category">
                  Category (Optional - e.g., Golf, Bar, Kitchen)
                </Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>

              {formData.moduleType === 'video' && (
                <div>
                  <Label htmlFor="videoUrl">Video URL (YouTube or direct link)</Label>
                  <Input
                    id="videoUrl"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content">Content (HTML supported)</Label>
                <textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full min-h-[200px] rounded-xl border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Enter training content..."
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 5"
                />
              </div>

              {/* Quiz Questions */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Quiz Questions (Optional)</Label>
                  <Button type="button" onClick={addQuizQuestion} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Question
                  </Button>
                </div>
                {formData.quizQuestions.map((q, idx) => (
                  <Card key={idx} className="mb-4">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Question {idx + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => removeQuizQuestion(idx)}
                          variant="ghost"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Question text"
                        value={q.question}
                        onChange={(e) => updateQuizQuestion(idx, 'question', e.target.value)}
                      />
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={q.correctAnswer === optIdx}
                            onChange={() => updateQuizQuestion(idx, 'correctAnswer', optIdx)}
                            className="h-4 w-4"
                          />
                          <Input
                            placeholder={`Option ${optIdx + 1}`}
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...q.options]
                              newOptions[optIdx] = e.target.value
                              updateQuizQuestion(idx, 'options', newOptions)
                            }}
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {editingCourse ? 'Update' : 'Create'} Module
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCourse(null)
                    setFormData({
                      title: '',
                      description: '',
                      videoUrl: '',
                      content: '',
                      site: '',
                      requiredScope: 'none',
                      category: '',
                      moduleType: 'video',
                      duration: '',
                      quizQuestions: [],
                    })
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {courses.map((course) => (
          <Card key={course.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>
                    {course.site || 'All Sites'} • {course.moduleType} • {course.duration ? `${course.duration} min` : 'N/A'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(course)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {course.description && (
              <CardContent>
                <p className="text-sm text-muted-foreground">{course.description}</p>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
