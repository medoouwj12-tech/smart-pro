import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { db } from './db';
const configuredSecret=process.env.AUTH_SECRET;
if(process.env.NODE_ENV==='production'&&(!configuredSecret||configuredSecret.length<32))throw new Error('AUTH_SECRET must contain at least 32 characters in production.');
const secret = new TextEncoder().encode(configuredSecret || 'development-secret-change-me-now-32');
export async function issueSession(user: { id:string; organizationId:string; roleId:string }) {
 const token = await new SignJWT({ sub:user.id, org:user.organizationId, role:user.roleId }).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(secret);
 (await cookies()).set('sg_session', token, {httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:28800});
}
export async function getSession() {
 try { const token=(await cookies()).get('sg_session')?.value; if(!token)return null; const {payload}=await jwtVerify(token,secret); return {userId:String(payload.sub),organizationId:String(payload.org),roleId:String(payload.role)}; } catch { return null; }
}
export async function getActor() { const session=await getSession(); if(!session)return null; const user=await db.user.findUnique({where:{id:session.userId},include:{role:true,organization:true,employee:true}}); if(!user||user.status!=='ACTIVE')return null; return user; }
