import { useState, useEffect, useCallback } from 'react'
import { Layout } from '../components/Layout.jsx'
import { Card } from '../components/Card.jsx'
import { Button } from '../components/Button.jsx'
import { Input } from '../components/Input.jsx'
import { Modal } from '../components/Modal.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, Plus, MessageCircle, Heart, Send, Search, Filter, 
  User, Clock, Image as ImageIcon, X, Edit3, Trash2, 
  Stethoscope, Heart as HeartIcon, Calendar, Pill,
  ChefHat
} from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { API_CONFIG } from '../config/api.js'

const nav = [
  {to:'/dashboard/user', label:'Overview', icon: User},
  {to:'/dashboard/user/journal', label:'Health Journal', icon: Edit3},
  {to:'/dashboard/user/doctors', label:'Available Doctors', icon: Stethoscope},
  {to:'/dashboard/user/appointments', label:'My Appointments', icon: Calendar},
  {to:'/dashboard/user/prescriptions', label:'Prescriptions', icon: Heart},
  {to:'/dashboard/user/medicines', label:'Medicines', icon: Pill},
  {to:'/dashboard/user/diet', label:'AI Diet Plan', icon: ChefHat},
  {to:'/dashboard/user/community', label:'Community', icon: Users}
]

// PostCard component moved outside to prevent re-renders
const PostCard = ({ post, likedPosts, handleLikePost, postComments, handleCommentChange, handleCommentSubmit, user, expandedComments, toggleComments, handleCommentDelete }) => (
  <div>
    <Card className="mb-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium">
            {post.creator?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-slate-800 dark:text-white">
                {post.creator?.name || 'Loading...'}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">•</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Healthcare Community Member
            </p>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
          {post.title}
        </h3>
        
        {post.content && (
          <p className="text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            {post.content}
          </p>
        )}

        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post image"
              className="w-full max-h-96 object-cover"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikePost(post._id)}
              className={`text-slate-600 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors ${
                likedPosts.has(post._id) ? 'text-red-500 dark:text-red-400' : ''
              }`}
            >
              <Heart className={`w-4 h-4 mr-1 ${likedPosts.has(post._id) ? 'fill-current' : ''}`} />
              {likedPosts.has(post._id) ? 'Liked' : 'Like'} ({post.likes || 0})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleComments(post._id)}
              className="text-slate-600 dark:text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Comment ({post.comments?.length || 0})
            </Button>
          </div>
        </div>

        {/* Comments section */}
        {expandedComments.has(post._id) && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {/* Existing comments */}
            {post.comments && post.comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {post.comments.slice().reverse().slice(0, 3).map((comment) => (
                  <div key={comment._id} className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {comment.commenter?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-slate-800 dark:text-white">
                            {comment.commenter?.name || 'Anonymous User'}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {/* Delete button - only show for comment author */}
                        {(comment.commenter?._id === user?._id || comment.commenter?.id === user?.id) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCommentDelete(comment._id, post._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 h-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {post.comments.length > 3 && (
                  <div className="text-center">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View all {post.comments.length} comments
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Comment input section */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <Input
                placeholder="Write a comment..."
                value={postComments[post._id] || ''}
                onChange={(e) => handleCommentChange(post._id, e.target.value)}
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCommentSubmit(post._id)
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => handleCommentSubmit(post._id)}
                className="bg-blue-500 hover:bg-blue-600"
                disabled={!postComments[post._id]?.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  </div>
)

export const Community = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('groups')
  const [groups, setGroups] = useState([])
  const [posts, setPosts] = useState([])
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
  const [showCreatePostModal, setShowCreatePostModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Form states
  const [newGroup, setNewGroup] = useState({
    title: '',
    description: '',
    image: null
  })
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    image: null
  })
  const [postComments, setPostComments] = useState({}) // Individual comments for each post
  const [likedPosts, setLikedPosts] = useState(new Set()) // Track liked posts
  const [expandedComments, setExpandedComments] = useState(new Set()) // Track which posts have expanded comments

  const API_BASE = API_CONFIG.API_URL

  // Simple notification function
  const showNotification = (message, type = 'info') => {
    // For now, use alert - can be enhanced later with proper toast notifications
    if (type === 'error') {
      alert(`Error: ${message}`)
    } else if (type === 'success') {
      alert(`Success: ${message}`)
    } else {
      alert(message)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const response = await fetch(`${API_BASE}/groups`)
      if (response.ok) {
        const data = await response.json()
        setGroups(data.groups || [])
      }
    } catch (error) {
      console.error('Error fetching groups:', error)
      showNotification('Failed to load groups', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchGroupPosts = async (groupId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/group/${groupId}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched posts data:', data)
        setPosts(data.groupPosts || [])
        
        // Initialize liked posts based on user's likes
        const userLikedPosts = new Set()
        if (data.groupPosts) {
          data.groupPosts.forEach(post => {
            if (post.likedBy && post.likedBy.includes(user._id || user.id)) {
              userLikedPosts.add(post._id)
            }
          })
        }
        setLikedPosts(userLikedPosts)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      showNotification('Failed to load posts', 'error')
    }
  }

  const createGroup = async () => {
    console.log('createGroup function called')
    console.log('newGroup:', newGroup)
    console.log('user:', user)
    
    if (!newGroup.title.trim() || !newGroup.description.trim()) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', newGroup.title)
      formData.append('description', newGroup.description)
      formData.append('userId', user._id || user.id)
      
      if (newGroup.image) {
        formData.append('image', newGroup.image)
      }

      console.log('Sending request to:', `${API_BASE}/groups`)
      console.log('FormData entries:', [...formData.entries()])

      const response = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        body: formData
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (response.ok) {
        const data = await response.json()
        console.log('Response data:', data)
        setGroups(prev => [data.creation.group, ...prev])
        setNewGroup({ title: '', description: '', image: null })
        setShowCreateGroupModal(false)
        showNotification('Group created successfully!', 'success')
      } else {
        const errorData = await response.text()
        console.log('Error response:', errorData)
        throw new Error(`Failed to create group: ${response.status} ${errorData}`)
      }
    } catch (error) {
      console.error('Error creating group:', error)
      showNotification('Failed to create group', 'error')
    }
  }

  const createPost = async () => {
    console.log('createPost function called')
    console.log('selectedGroup:', selectedGroup)
    console.log('newPost:', newPost)
    console.log('user:', user)
    
    if (!selectedGroup || !newPost.title.trim()) {
      showNotification('Please fill in all required fields', 'error')
      return
    }

    try {
      const formData = new FormData()
      formData.append('title', newPost.title)
      formData.append('content', newPost.content || '')
      formData.append('userId', user._id || user.id)
      
      if (newPost.image) {
        formData.append('image', newPost.image)
      }

      console.log('Sending post request to:', `${API_BASE}/posts/group/${selectedGroup._id}`)
      console.log('FormData entries:', [...formData.entries()])

      const response = await fetch(`${API_BASE}/posts/group/${selectedGroup._id}`, {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setPosts(prev => [data.creation.post, ...prev])
        setNewPost({ title: '', content: '', image: null })
        setShowCreatePostModal(false)
        showNotification('Post created successfully!', 'success')
        fetchGroupPosts(selectedGroup._id)
      } else {
        throw new Error('Failed to create post')
      }
    } catch (error) {
      console.error('Error creating post:', error)
      showNotification('Failed to create post', 'error')
    }
  }

  const handleGroupSelect = (group) => {
    setSelectedGroup(group)
    setActiveTab('posts')
    fetchGroupPosts(group._id)
  }

  const handleLikePost = useCallback(async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user._id || user.id })
      })

      if (response.ok) {
        const data = await response.json()
        // Update the posts list with new like count
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, likes: data.likes, likedBy: data.post.likedBy }
            : post
        ))
        
        // Update local liked state
        setLikedPosts(prev => {
          const newLiked = new Set(prev)
          if (data.liked) {
            newLiked.add(postId)
            showNotification('Post liked!', 'success')
          } else {
            newLiked.delete(postId)
            showNotification('Post unliked!', 'info')
          }
          return newLiked
        })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
      showNotification('Failed to update like', 'error')
    }
  }, [user, API_BASE])

  const handleCommentChange = useCallback((postId, value) => {
    setPostComments(prev => ({ ...prev, [postId]: value }))
  }, [])

  const handleCommentSubmit = useCallback(async (postId) => {
    const commentText = postComments[postId]
    if (!commentText?.trim()) return

    try {
      const response = await fetch(`${API_BASE}/comments/post/${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          content: commentText,
          userId: user._id || user.id 
        })
      })

      if (response.ok) {
        const data = await response.json()
        // Update the posts list with new comment
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, comments: [...(post.comments || []), data.creation.comment] }
            : post
        ))
        
        // Clear the comment input for this post
        setPostComments(prev => ({ ...prev, [postId]: '' }))
        showNotification('Comment added successfully!', 'success')
        
        // Refresh posts to get updated comment count
        if (selectedGroup) {
          fetchGroupPosts(selectedGroup._id)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      showNotification('Failed to add comment', 'error')
    }
  }, [postComments, user, API_BASE, selectedGroup])

  const handleCommentDelete = useCallback(async (commentId, postId) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId: user._id || user.id 
        })
      })

      if (response.ok) {
        // Update the posts list by removing the deleted comment
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { 
                ...post, 
                comments: post.comments.filter(comment => comment._id !== commentId) 
              }
            : post
        ))
        
        showNotification('Comment deleted successfully!', 'success')
        
        // Refresh posts to get updated comment count
        if (selectedGroup) {
          fetchGroupPosts(selectedGroup._id)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete comment')
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      showNotification('Failed to delete comment', 'error')
    }
  }, [user, API_BASE, selectedGroup])

  const toggleComments = useCallback((postId) => {
    setExpandedComments(prev => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(postId)) {
        newExpanded.delete(postId)
      } else {
        newExpanded.add(postId)
      }
      return newExpanded
    })
  }, [])

  const filteredGroups = groups.filter(group => 
    group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const GroupCard = ({ group }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group cursor-pointer"
      onClick={() => handleGroupSelect(group)}
    >
      <Card className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          {group.coverImage && (
            <div className="mb-4 rounded-lg overflow-hidden">
              <img 
                src={group.coverImage} 
                alt={group.title}
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
          )}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {group.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                {group.description}
              </p>
            </div>
            <Users className="w-5 h-5 text-blue-500 flex-shrink-0 ml-2" />
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{group.posts?.length || 0} posts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{new Date(group.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <Layout items={nav}>
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout items={nav}>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center">
                <Users className="w-8 h-8 mr-3 text-blue-500" />
                Healthcare Community
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Connect with others, share experiences, and support each other on your health journey
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {selectedGroup && activeTab === 'posts' && (
                <Button
                  onClick={() => setShowCreatePostModal(true)}
                  className="bg-green-500 hover:bg-green-600 flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Post
                </Button>
              )}
              <Button
                onClick={() => {
                  console.log('New Group button clicked')
                  setShowCreateGroupModal(true)
                }}
                className="bg-blue-500 hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Group
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => {
                setActiveTab('groups')
                setSelectedGroup(null)
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'groups'
                  ? 'bg-blue-500 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Groups ({groups.length})
            </button>
            {selectedGroup && (
              <button
                onClick={() => setActiveTab('posts')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {selectedGroup.title} Posts
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        {activeTab === 'groups' && (
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search groups by name or topic..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredGroups.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredGroups.map((group) => (
                    <GroupCard key={group._id} group={group} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    No groups found
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a healthcare support group!'}
                  </p>
                  <Button
                    onClick={() => setShowCreateGroupModal(true)}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Group
                  </Button>
                </Card>
              )}
            </motion.div>
          )}

          {activeTab === 'posts' && selectedGroup && (
            <motion.div
              key="posts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Group Header */}
              <Card className="mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-indigo-200 dark:border-indigo-800">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {selectedGroup.coverImage && (
                        <img
                          src={selectedGroup.coverImage}
                          alt={selectedGroup.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                          {selectedGroup.title}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                          {selectedGroup.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                          <span>{posts.length} posts</span>
                          <span>•</span>
                          <span>Created {new Date(selectedGroup.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab('groups')
                        setSelectedGroup(null)
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Back to Groups
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Posts */}
              {posts.length > 0 ? (
                <div>
                  {posts.map((post) => (
                    <PostCard 
                      key={post._id} 
                      post={post}
                      likedPosts={likedPosts}
                      handleLikePost={handleLikePost}
                      postComments={postComments}
                      handleCommentChange={handleCommentChange}
                      handleCommentSubmit={handleCommentSubmit}
                      handleCommentDelete={handleCommentDelete}
                      user={user}
                      expandedComments={expandedComments}
                      toggleComments={toggleComments}
                    />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <MessageCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
                    No posts yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Start the conversation in this group!
                  </p>
                  <Button
                    onClick={() => setShowCreatePostModal(true)}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Group Modal */}
        <Modal open={showCreateGroupModal} onClose={() => setShowCreateGroupModal(false)}>
          <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Create New Group
            </h2>
            <div className="space-y-4">
              <Input
                label="Group Name *"
                placeholder="e.g., Diabetes Support Network"
                value={newGroup.title}
                onChange={(e) => setNewGroup(prev => ({ ...prev, title: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                  rows="3"
                  placeholder="Describe what this group is about..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Cover Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewGroup(prev => ({ ...prev, image: e.target.files[0] }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={() => {
                    console.log('Create Group button in modal clicked')
                    createGroup()
                  }}
                  className="flex-1 bg-blue-500 hover:bg-blue-600"
                >
                  Create Group
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateGroupModal(false)
                    setNewGroup({ title: '', description: '', image: null })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        {/* Create Post Modal */}
        <Modal open={showCreatePostModal} onClose={() => setShowCreatePostModal(false)}>
          <div className="p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
              Create New Post
            </h2>
            {selectedGroup && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Posting in: <span className="font-medium">{selectedGroup.title}</span>
                </p>
              </div>
            )}
            <div className="space-y-4">
              <Input
                label="Post Title *"
                placeholder="What's on your mind?"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Content (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                  rows="4"
                  placeholder="Share your thoughts, experiences, or questions..."
                  value={newPost.content}
                  onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Image (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewPost(prev => ({ ...prev, image: e.target.files[0] }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={createPost}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Create Post
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreatePostModal(false)
                    setNewPost({ title: '', content: '', image: null })
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}
