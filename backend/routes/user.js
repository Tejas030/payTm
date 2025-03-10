// backend/routes/user.js
const express = require('express');
const zod=require('zod');
const { User, Account } = require('../db');
const JWT_SECRET = require('../config');
const jwt=require("jsonwebtoken")
const  { authMiddleware } = require("../middleware");


const signupBody=zod.object({
    username: zod.string(),
	firstName: zod.string(),
	lastName: zod.string(),
	password: zod.string()
})

const router = express.Router();

router.post("/signup",async(req,res)=>
{
    console.log("Received Body:", req.body);  // 🛠 Debuggin
    const parsedData=signupBody.safeParse(req.body)
    if(!parsedData.success)
    {
        return res.status(411).json({
            msg:"Email Already takennwddew /Input is invalid",
            errors: parsedData.error.errors 

        })
    }

    const existinguser=await User.findOne({username:req.body.username})

    if(existinguser)
    {
        return res.status(411).json({
            msg:"Email Already taken /Input is invalid"

        })
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    })

    const userId = user._id;

    await Account.create({userId,
        balance:1+Math.random()*10000
    })

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
        token: token
    })


})

const signinBody=zod.object({
    username:zod.string().email(),
    password:zod.string()

})
 

router.post("/signin",async(req,res)=>
{
    const { success } = signinBody.safeParse(req.body)
    if (!success) {
        return res.status(411).json({
            message: "Email already taken / Incorrect inputs"
        })
    }

    const user=await User.findOne({
        username:req.body.username,
        password:req.body.password
    })

    if(user)
    {
       const token= jwt.sign({
        userId:user._id
       },JWT_SECRET);

       res.json({
        token: token
    })
    return;
    }
    res.status(411).json({
        message: "Error while logging in"
    })

})





// other auth routes

const updateBody = zod.object({
	password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    const { success } = updateBody.safeParse(req.body)
    console.log(req.body)
    if (!success) {
        res.status(411).json({
            message: "Error while updating information"
        })
    }

		await User.updateOne(req.body,{ _id: req.userId });
	
    res.json({
        message: "Updated successfully"
    })
})


router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;