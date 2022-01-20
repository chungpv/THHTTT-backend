const dashboard = async (req, res) => {
    const {type} = req.params
    try {
        
    } catch (error) {
        return res.status(401).send('Cannot work. Try again')
    }
}

const dashboardPost = async (req, res) => {

}

const dashboardTag = async (req, res) => {

}

const dashboardUser = async (req, res) => {

}

export {
    dashboard,
    dashboardPost,
    dashboardTag,
    dashboardUser
}
