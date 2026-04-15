const mongoose = require("mongoose")


const tokenBlackListSchema = new mongoose.Schema({ 
    token: {
        type: String,
        required: [true, "Token is required to blacklist"],
        unique: [true, "Token already blacklisted"]
    }
},{
    timestamps: true
})

tokenBlackListSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 }) // Blacklist entries will automatically be removed after 7 days;

const tokenBlackListModel = mongoose.model("tokenBlackList", tokenBlackListSchema)

module.exports = tokenBlackListModel