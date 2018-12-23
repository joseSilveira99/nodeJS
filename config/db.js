if (process.env.NODE_END = 'production') {
  module.exports = {mongoURI: 'mongodb://nomebanco:senha@ds157479.mlab.com:57479/blogapp-prod'}
}else{
 module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}
