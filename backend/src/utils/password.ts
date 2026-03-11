import bcrypt from 'bcryptjs';

export const hashPassword = async (plain:string) =>{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(plain, salt);
}

export const verifyPassword = async (plain:string, hash:string) =>{
    return await bcrypt.compare(plain, hash);
}