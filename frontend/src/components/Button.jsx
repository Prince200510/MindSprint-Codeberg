export const Button = ({variant='solid',children,className='',...p}) => {
  const base = 'px-6 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105'
  const styles = {
    solid: 'bg-gradient-to-r from-primary to-primary/90 text-white hover:shadow-lg hover:shadow-primary/25',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    subtle: 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
  }
  return <button className={`${base} ${styles[variant]} ${className}`} {...p}>{children}</button>
}
