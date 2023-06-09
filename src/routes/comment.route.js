const express = require("express");
const { Types } = require("mongoose");
const Comment = require("../models/commentSchema");
const User = require("../models/userSchema");

const commentRoutes = express.Router();


commentRoutes.route('/').get(async (req, res) => {
    try {
        const result = await Comment.find()

        res.json({ success: true, data: result })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }

});

commentRoutes.route('/:id').get(async (req, res) => {
    try {
        console.log(req.params);
        const { id } = req.params

        if (Types.ObjectId.isValid(id)) {
            const result = await Comment.findById({ _id: id })

            if (result) {
                res.json({ success: true, data: result })
            }
            else {
                res.status(404).json({ success: false, message: "Record not found" })
            }
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
});

commentRoutes.route('/add').post(async (req, res) => {
    try {
        const { description, is_reply, parent_comment_id, user_id, bug_id } = req.body

        if (!description || !user_id || !bug_id) {
            res.status(400).json({ success: false, message: "Description, user_id, bug_id are required" })
        }
        else if (!Types.ObjectId.isValid(user_id) || !await User.findById({ _id: user_id })) {
            res.status(400).json({ success: false, message: "Invalid user id" })
        }
        else if (!Types.ObjectId.isValid(bug_id) || !await Bug.findById({ _id: bug_id })) {
            res.status(400).json({ success: false, message: "Invalid bug id" })
        }
        else if (parent_comment_id && !Types.ObjectId.isValid(parent_comment_id) || !await Comment.findById({ _id: parent_comment_id })) {
            res.status(400).json({ success: false, message: "Invalid parent comment id" })
        }
        else {
            let newCommentObj = { description, is_reply, user_id, bug_id }
            if (parent_comment_id) {
                newCommentObj = { ...newCommentObj, parent_comment_id }
            }
            const newComment = new Comment({ description, is_reply, user_id, bug_id })

            await newComment.save()
            res.status(201).json({ success: true, data: newComment })

            console.log(req.body);
        }

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }

});

commentRoutes.route('/update/:id').put(async (req, res) => {
    try {
        const { id } = req.params
        const { name, workspace_id } = req.body

        if (Types.ObjectId.isValid(id)) {
            if (!name && !workspace_id) {
                res.status(400).json({ success: false, message: "Name or workspace must be provided" })
            }
            if (workspace_id) {
                if (!Types.ObjectId.isValid(workspace_id) || !await Comment.findById({ _id: workspace_id })) {
                    res.status(400).json({ success: false, message: "Invalid workspace id" })
                }
            }

            const updatedComment = await Comment.findByIdAndUpdate(id, req.body, { runValidators: true, new: true })

            if (updatedComment) {
                res.json({ success: true, data: updatedComment })
            }
            else {
                res.status(404).json({ success: false, message: "Record not found" })
            }

            console.log(req.body);

        }
        else {
            res.status(400).json({ success: false, message: "Invalid id" })
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }

});

commentRoutes.route('/delete/:id').delete(async (req, res) => {
    try {
        const { id } = req.params

        if (Types.ObjectId.isValid(id)) {
            const deletedComment = await Comment.findByIdAndDelete({ _id: id })

            if (deletedComment) {
                res.json({ success: true, data: deletedComment })
            }
            else {
                res.status(404).json({ success: false, data: "Record not found" })
            }
        }
        else {
            res.status(400).json({ success: false, message: "Invalid id" })
        }
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        })
    }

});

module.exports = commentRoutes;