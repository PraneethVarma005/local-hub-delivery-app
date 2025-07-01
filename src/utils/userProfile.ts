
import { supabase } from '@/lib/supabase'

export const createUserProfile = async (user: any, role: string) => {
  try {
    console.log('Creating user profile for:', user.email, 'with role:', role)
    
    const profileData = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
      role: role,
      user_type: role,
      avatar_url: user.user_metadata?.avatar_url || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      // Update existing profile with role
      const { error } = await supabase
        .from('user_profiles')
        .update({ role, user_type: role, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      
      if (error) {
        console.error('Error updating user profile:', error)
        throw error
      }
      
      console.log('User profile updated successfully')
    } else {
      // Create new profile
      const { error } = await supabase
        .from('user_profiles')
        .insert([profileData])

      if (error) {
        console.error('Error creating user profile:', error)
        throw error
      }
      
      console.log('User profile created successfully')
    }

    // Also create user agreements record
    const agreementData = {
      user_id: user.id,
      user_type: role,
      privacy_policy_accepted: true,
      return_policy_accepted: true,
      terms_accepted: true,
      accepted_at: new Date().toISOString()
    }

    const { error: agreementError } = await supabase
      .from('user_agreements')
      .upsert([agreementData])

    if (agreementError) {
      console.error('Error creating user agreements:', agreementError)
    } else {
      console.log('User agreements created successfully')
    }

  } catch (error) {
    console.error('Exception in createUserProfile:', error)
    throw error
  }
}
