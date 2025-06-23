
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase'

interface RatingSystemProps {
  shopId: string
  existingRating?: { rating: number; review: string } | null
}

const RatingSystem: React.FC<RatingSystemProps> = ({ shopId, existingRating }) => {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [review, setReview] = useState(existingRating?.review || '')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const submitRating = async () => {
    if (!user || rating === 0) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('shop_ratings')
        .upsert({
          shop_id: shopId,
          customer_id: user.id,
          rating,
          review
        })

      if (error) throw error

      toast({
        title: 'Rating submitted',
        description: 'Thank you for your feedback!',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit rating',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate this shop</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Button
              key={star}
              variant="ghost"
              size="sm"
              onClick={() => setRating(star)}
              className="p-1 hover:bg-transparent"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                }`}
              />
            </Button>
          ))}
        </div>
        <Textarea
          placeholder="Write your review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
        <Button
          onClick={submitRating}
          disabled={loading || rating === 0}
          className="w-full bg-[#16A085] hover:bg-[#16A085]/90"
        >
          {loading ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default RatingSystem
