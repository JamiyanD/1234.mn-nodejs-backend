const errorHandler = (err, req, res, next) => {
    console.log(err)

    const error = {...err}

    error.message = err.message

    if(err.code === 'CastError') {
        err.message = 'Ene Id buruu butetstei ID baina'
    } else if (err.name == 'ValidationError') {
        err.message = 'model validate buru bna'
    } else if (err.code == 11000 ) {
        console.log('hha')
        error.message = 'Ene talbariin utgiig davharduulj bolohgui'
    }

    res.status(err.statusCode || 500).json({
        success: false,
        error: error,
        code: 'aldaa hhha'
    })

}

module.exports = errorHandler;