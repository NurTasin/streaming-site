import { Request, Response } from "express";
import { ApiResponse } from "../../interfaces/Resposne";
import { User } from "../../../prisma/client";
class UserControllerV1{
    register = async (req: Request, res: Response)=>{
        return res.status(200).json({
            error: false,
            msg: "Not implemented"
        } as ApiResponse<undefined>);
    }
}

export default new UserControllerV1;