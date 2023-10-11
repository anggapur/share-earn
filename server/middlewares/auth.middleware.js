module.exports = function(req, res, next) {    
    if (!req.user) {        
        // Already authenticated.
        return res.status(400).json({ errCode: 'ERR_AUTH', message: "Not Authorized" });
    }    
    next();
}