const User = require("../../models/user.model.js");

const generateAccessToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();

        return accessToken;


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}
exports.register = async (req, res) => {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ success: false, msg: "Please provide all required fields" });
    }


    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, msg: "User with email already exists" })
    }
    const user = await User.create({

        email,
        fullName,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password"
    )

    if (!createdUser) {
        return res.status(400).json({ success: false, msg: "Something went wrong while registering the user" })
    }

    return res.status(200).json({
        success: true,
        data: createdUser,
        msg: "User registered successfully"
    });



};
exports.login = async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        return res.status(400).json({ success: false, msg: "email is required" })
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ success: false, msg: "User does not exist" })
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        res.status(400).json({ success: false, msg: "Invalid user credentials" })
    }

    const accessToken = await generateAccessToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password");


    return res
        .status(200)

        .json({
            success: true,
            data: loggedInUser,
            token: accessToken,
            msg: "User logged In Successfully"
        });

}


