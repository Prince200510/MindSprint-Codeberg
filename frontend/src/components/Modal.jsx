export const Modal = ({open,onClose,children, size = 'md'}) => {
  if(!open) return null
  
  const sizeClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-lg', 
    'lg': 'max-w-2xl',
    'xl': 'max-w-4xl'
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto relative mx-4`}>
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {children}
      </div>
    </div>
  )
}
