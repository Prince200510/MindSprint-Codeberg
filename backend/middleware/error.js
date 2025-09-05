export const notFound = (req,res,next) => {
  res.status(404).json({error:'not_found'})
}

export const errorHandler = (err,req,res,next) => {
  const status = err.status || 500
  res.status(status).json({error: err.message || 'server_error'})
}
