const signup = async (req, res) => {
    res.json({status: 'Signup'})
};

const signin = async (req, res) => {
    res.json({status: 'Signin'})
};

const logout = async (req, res) => {
    res.json({status: 'Logout'})
};

export {
    signup,
    signin,
    logout
}