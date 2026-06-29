import { useState } from 'react'
import { supabase } from '../utils/supabaseClient'
export function useResumeCloud() {
  const [saving, setSaving]   = useState(false)
  const [saveError, setSaveError] = useState(null)

  const saveResume = async ({ userId, title, data, existingId = null }) => {
    setSaving(true)
    setSaveError(null)
    try {
      if (existingId) {
        const { data: updated, error } = await supabase
          .from('resumes')
          .update({ title, data, updated_at: new Date().toISOString() })
          .eq('id', existingId)
          .select()
          .single()
        if (error) throw error
        return { data: updated, error: null }
      } else {
        const { data: created, error } = await supabase
          .from('resumes')
          .insert({ user_id: userId, title, data })
          .select()
          .single()
        if (error) throw error
        return { data: created, error: null }
      }
    } catch (err) {
      setSaveError(err.message)
      return { data: null, error: err }
    } finally {
      setSaving(false)
    }
  }

  const saveCoverLetter = async ({ userId, title, content, existingId = null }) => {
    setSaving(true)
    setSaveError(null)
    try {
      if (existingId) {
        const { data: updated, error } = await supabase
          .from('cover_letters')
          .update({ title, content, updated_at: new Date().toISOString() })
          .eq('id', existingId)
          .select()
          .single()
        if (error) throw error
        return { data: updated, error: null }
      } else {
        const { data: created, error } = await supabase
          .from('cover_letters')
          .insert({ user_id: userId, title, content })
          .select()
          .single()
        if (error) throw error
        return { data: created, error: null }
      }
    } catch (err) {
      setSaveError(err.message)
      return { data: null, error: err }
    } finally {
      setSaving(false)
    }
  }

  return { saveResume, saveCoverLetter, saving, saveError }
}