import { error } from "console";
import { Request } from "express";

export const fileFilter = (req: Request, file: Express.Multer.File, callback:Function) => {
    if(!file) return callback(new Error('No file provided'),false)
    
    const fileExtension=file.mimetype.split('/')[1]
    const validExtensions=['jpg','jpeg','png']
    if(validExtensions.includes(fileExtension)) return callback(null,true)
    callback(null,false)
}