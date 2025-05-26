'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Heart, 
  Reply, 
  MoreHorizontal,
  Send,
  ThumbsUp,
  Flag,
  Edit,
  Trash2,
  User
} from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from '@/utils/format'

interface Comment {
  id: string
  author: {
    id: string
    name: string
    avatar?: string
    isVerified?: boolean
  }
  content: string
  createdAt: string
  updatedAt?: string
  likes: number
  isLiked: boolean
  replies?: Comment[]
  isEdited?: boolean
}

interface CommentSystemProps {
  targetId: string
  targetType: 'association' | 'campaign'
  comments?: Comment[]
  allowComments?: boolean
  currentUserId?: string
  className?: string
}

export function CommentSystem({
  targetId,
  targetType,
  comments = [],
  allowComments = true,
  currentUserId,
  className = ''
}: CommentSystemProps) {
  const [localComments, setLocalComments] = useState<Comment[]>(comments)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'oldest'>('recent')

  useEffect(() => {
    // Simuler le chargement des commentaires depuis l'API
    const loadComments = async () => {
      setIsLoading(true)
      // TODO: Remplacer par un vrai appel API
      await new Promise(resolve => setTimeout(resolve, 500))
      setLocalComments(mockComments)
      setIsLoading(false)
    }

    loadComments()
  }, [targetId, targetType])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        id: currentUserId || 'anonymous',
        name: 'Utilisateur Connecté',
        avatar: '/api/placeholder/40/40',
        isVerified: false
      },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: []
    }

    setLocalComments(prev => [comment, ...prev])
    setNewComment('')
    
    // TODO: Envoyer à l'API
    console.log('Nouveau commentaire:', comment)
  }

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: Date.now().toString(),
      author: {
        id: currentUserId || 'anonymous',
        name: 'Utilisateur Connecté',
        avatar: '/api/placeholder/40/40'
      },
      content: replyContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }

    setLocalComments(prev => 
      prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), reply] }
          : comment
      )
    )

    setReplyingTo(null)
    setReplyContent('')
  }

  const handleLike = (commentId: string) => {
    setLocalComments(prev =>
      prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          }
        }
        return comment
      })
    )
  }

  const handleEdit = (commentId: string, newContent: string) => {
    setLocalComments(prev =>
      prev.map(comment =>
        comment.id === commentId
          ? { ...comment, content: newContent, isEdited: true, updatedAt: new Date().toISOString() }
          : comment
      )
    )
    setEditingComment(null)
    setEditContent('')
  }

  const handleDelete = (commentId: string) => {
    setLocalComments(prev => prev.filter(comment => comment.id !== commentId))
  }

  const sortedComments = [...localComments].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.likes - a.likes
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'recent':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  return (
    <div className={`space-y-6 ${className}`}>
      {/* En-tête des commentaires */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold">
            Commentaires ({localComments.length})
          </h3>
        </div>

        {localComments.length > 0 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Plus récents</option>
            <option value="popular">Plus populaires</option>
            <option value="oldest">Plus anciens</option>
          </select>
        )}
      </div>

      {/* Formulaire nouveau commentaire */}
      {allowComments && (
        <Card className="p-4">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Partagez votre opinion ou vos encouragements..."
              className="w-full p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Soyez respectueux et constructif dans vos commentaires
              </p>
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                Publier
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Liste des commentaires */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : sortedComments.length === 0 ? (
        <Card className="p-8 text-center">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Aucun commentaire pour le moment
          </h4>
          <p className="text-gray-600">
            Soyez le premier à partager votre opinion !
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              onLike={() => handleLike(comment.id)}
              onReply={() => setReplyingTo(comment.id)}
              onEdit={(content) => handleEdit(comment.id, content)}
              onDelete={() => handleDelete(comment.id)}
              isReplying={replyingTo === comment.id}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={() => handleReply(comment.id)}
              onCancelReply={() => setReplyingTo(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onLike: () => void
  onReply: () => void
  onEdit: (content: string) => void
  onDelete: () => void
  isReplying: boolean
  replyContent: string
  setReplyContent: (content: string) => void
  onSubmitReply: () => void
  onCancelReply: () => void
}

function CommentItem({
  comment,
  currentUserId,
  onLike,
  onReply,
  onEdit,
  onDelete,
  isReplying,
  replyContent,
  setReplyContent,
  onSubmitReply,
  onCancelReply
}: CommentItemProps) {
  const [showActions, setShowActions] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)

  const isOwner = currentUserId === comment.author.id

  const handleEdit = () => {
    onEdit(editContent)
    setIsEditing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="p-4">
        <div className="flex space-x-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.author.avatar ? (
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* En-tête du commentaire */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-900">
                {comment.author.name}
              </span>
              {comment.author.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  Vérifié
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt))}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-400">(modifié)</span>
              )}
            </div>

            {/* Contenu du commentaire */}
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Sauvegarder
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 mb-3 whitespace-pre-wrap">
                {comment.content}
              </p>
            )}

            {/* Actions du commentaire */}
            <div className="flex items-center gap-4">
              <button
                onClick={onLike}
                className={`flex items-center gap-1 text-sm transition-colors ${
                  comment.isLiked
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${comment.isLiked ? 'fill-current' : ''}`}
                />
                {comment.likes > 0 && comment.likes}
              </button>

              <button
                onClick={onReply}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Répondre
              </button>

              {isOwner && (
                <div className="relative">
                  <button
                    onClick={() => setShowActions(!showActions)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute top-6 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                      >
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setShowActions(false)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                        >
                          <Edit className="w-4 h-4" />
                          Modifier
                        </button>
                        <button
                          onClick={() => {
                            onDelete()
                            setShowActions(false)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                <Flag className="w-4 h-4" />
                Signaler
              </button>
            </div>

            {/* Formulaire de réponse */}
            <AnimatePresence>
              {isReplying && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2"
                >
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Répondre à ${comment.author.name}...`}
                    className="w-full p-2 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onSubmitReply} disabled={!replyContent.trim()}>
                      Répondre
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancelReply}>
                      Annuler
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Réponses */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-4 space-y-3">
                {comment.replies.map((reply) => (
                  <div key={reply.id} className="flex space-x-3 pl-4 border-l-2 border-gray-100">
                    <div className="flex-shrink-0">
                      {reply.author.avatar ? (
                        <Image
                          src={reply.author.avatar}
                          alt={reply.author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{reply.author.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(reply.createdAt))}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900">{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// Données mock pour les tests
const mockComments: Comment[] = [
  {
    id: '1',
    author: {
      id: 'user1',
      name: 'Sarah Cohen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612d17c?w=40&h=40&fit=crop&crop=face',
      isVerified: true
    },
    content: 'Excellent projet ! J\'ai hâte de voir le résultat final. Cette rénovation était vraiment nécessaire.',
    createdAt: '2024-05-25T14:30:00Z',
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: '2',
        author: {
          id: 'user2',
          name: 'David Levy',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
        },
        content: 'Tout à fait d\'accord ! Merci pour votre soutien.',
        createdAt: '2024-05-25T15:00:00Z',
        likes: 3,
        isLiked: true
      }
    ]
  },
  {
    id: '3',
    author: {
      id: 'user3',
      name: 'Rachel Dubois',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    content: 'Bravo pour cette initiative ! Je vais participer au financement dès que possible.',
    createdAt: '2024-05-24T16:45:00Z',
    likes: 8,
    isLiked: true
  }
]
