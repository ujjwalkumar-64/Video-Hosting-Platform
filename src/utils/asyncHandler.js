// promise ke through

const asyncHandler = (requestHandler) => {
   return (req,res,next) => {
        Promise.resolve(requestHandler(req,res,next)).
        catch((err)=> next(err))
    }
}

export {asyncHandler};



 

// higher order function me function ko pass krte hai 
/*
const asyncHandler = ()=>{}
const asyncHandler = (func)=>()=>{}
const asyncHandler = async (func)=>()=>{}

*/
/*
// try catch ke through

const asyncHandler = (fn) => async (req, res,next) => {
    try {
        await fn (req,res,next)
    } catch (error) {
        res.status(err.code || 500).json({
            success:false,
            message:err.message
        })
    }
}
 */