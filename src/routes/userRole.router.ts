import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { createUserRole, deleteUserRole, getAllUserRoles, getUserRoleById, updateUserRole } from '../controllers/userRole.controller';

const userRoleRouter = express.Router();

userRoleRouter.post('/', expressAsyncHandler(createUserRole));
userRoleRouter.get('/', expressAsyncHandler(getAllUserRoles));
userRoleRouter.get('/:id', expressAsyncHandler(getUserRoleById));
userRoleRouter.patch('/:id', expressAsyncHandler(updateUserRole));
userRoleRouter.delete('/:id', expressAsyncHandler(deleteUserRole));

export default userRoleRouter;
