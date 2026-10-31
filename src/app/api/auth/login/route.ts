import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { issueSession } from '@/lib/auth';
const schema=z.object({email:z.string().email().transform(v=>v.toLowerCase()),password:z.string().min(1),organizationSlug:z.string().min(1)});
const attempts=new Map<string,{count:number;resetAt:number}>();
export async function POST(req:Request){
 const parsed=schema.safeParse(await req.json().catch(()=>null)); if(!parsed.success)return NextResponse.json({error:'تحقق من بيانات الدخول'}, {status:400});
 const address=(req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown').split(',')[0].trim().slice(0,80);const now=Date.now();if(attempts.size>10000)for(const [key,value]of attempts)if(value.resetAt<now)attempts.delete(key);let attempt=attempts.get(address);if(!attempt||attempt.resetAt<now){attempt={count:0,resetAt:now+15*60*1000};attempts.set(address,attempt)}if(attempt.count>=8)return NextResponse.json({error:'محاولات كثيرة. حاول مجددًا بعد 15 دقيقة.'},{status:429,headers:{'Retry-After':String(Math.ceil((attempt.resetAt-now)/1000))}});
 const {email,password,organizationSlug}=parsed.data; const org=await db.organization.findUnique({where:{slug:organizationSlug}}); if(!org){attempt.count++;return NextResponse.json({error:'بيانات الدخول غير صحيحة'}, {status:401});}
 const user=await db.user.findUnique({where:{organizationId_email:{organizationId:org.id,email}},include:{role:true}}); if(!user||user.status!=='ACTIVE'||!(await bcrypt.compare(password,user.passwordHash))){attempt.count++;return NextResponse.json({error:'بيانات الدخول غير صحيحة'}, {status:401});}attempts.delete(address);
 await issueSession(user); await db.auditLog.create({data:{organizationId:org.id,userId:user.id,action:'LOGIN',entity:'User'}}); return NextResponse.json({user:{name:user.name,role:user.role.name}});
}
