import { supabase } from '@/integrations/supabase/client';
import { SpeechAnalysis } from '@/types/fluency';
import { Json } from '@/integrations/supabase/types';

export const uploadPracticeVideo = async (blob: Blob, userId: string): Promise<string | null> => {
  try {
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`;
    
    const { data, error } = await supabase.storage
      .from('practice-videos')
      .upload(fileName, blob, {
        contentType: 'video/webm',
        cacheControl: '3600',
      });

    if (error) {
      console.error('Error uploading video:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('practice-videos')
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Failed to upload video:', err);
    return null;
  }
};

export const savePracticeSessionToCloud = async (
  videoUrl: string | null,
  analysis: SpeechAnalysis,
  duration: number,
  userId: string
) => {
  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .insert([{
        user_id: userId,
        video_url: videoUrl,
        transcript: analysis.transcript,
        duration: Math.round(duration),
        fluency_score: analysis.fluencyScore,
        grammar_score: analysis.grammarScore,
        overall_score: analysis.overallScore,
        words_per_minute: analysis.wordsPerMinute,
        filler_words: JSON.parse(JSON.stringify(analysis.fillerWords)) as Json,
        grammar_issues: JSON.parse(JSON.stringify(analysis.grammarIssues)) as Json,
        suggestions: JSON.parse(JSON.stringify(analysis.suggestions)) as Json,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error saving session:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Failed to save session:', err);
    return null;
  }
};

export const getRecentCloudSessions = async (limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('practice_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching sessions:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Failed to fetch sessions:', err);
    return [];
  }
};

export const deleteCloudSession = async (sessionId: string, videoUrl: string | null) => {
  try {
    // Delete the video from storage if it exists
    if (videoUrl) {
      const url = new URL(videoUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/practice-videos/');
      if (pathParts[1]) {
        await supabase.storage.from('practice-videos').remove([pathParts[1]]);
      }
    }

    // Delete the session record
    const { error } = await supabase
      .from('practice_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      console.error('Error deleting session:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to delete session:', err);
    return false;
  }
};
