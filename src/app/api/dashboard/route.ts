import {NextResponse} from 'next/server'; import {getActor} from '@/lib/auth'; import {db} from '@/lib/db';
function zonedMidnight(year:number,month:number,day:number,tz:string){const wanted=Date.UTC(year,month-1,day);let guess=wanted;for(let i=0;i<3;i++){const p=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(guess));const g=(k:string)=>Number(p.find(x=>x.type===k)!.value);const shown=Date.UTC(g('year'),g('month')-1,g('day'),g('hour'),g('minute'),g('second'));guess+=wanted-shown;}return new Date(guess);}
export async function GET(){
 const actor=await getActor();if(!actor)return NextResponse.json({error:'يلزم تسجيل الدخول'},{status:401});
 const org=actor.organizationId,tz=actor.organization.timezone,supervisor=actor.role.key==='SUPERVISOR',hr=actor.role.key==='HR_MANAGER',security=actor.role.key==='SECURITY_OFFICER';
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
 const get=(key:string)=>Number(parts.find(x=>x.type===key)!.value);const y=get('year'),m=get('month'),d=get('day');
 const start=zonedMidnight(y,m,d,tz),next=new Date(Date.UTC(y,m-1,d+1)),end=zonedMidnight(next.getUTCFullYear(),next.getUTCMonth()+1,next.getUTCDate(),tz);
 const team=supervisor&&actor.employeeId?await db.employee.findMany({where:{organizationId:org,managerId:actor.employeeId},select:{id:true}}):[];
 const visibleIds=supervisor?[...(actor.employeeId?[actor.employeeId]:[]),...team.map((e:{id:string})=>e.id)]:undefined;
 const employeeWhere:any={organizationId:org,status:'ACTIVE'};const attendanceWhere:any={organizationId:org,occurredAt:{gte:start,lt:end}};const eventWhere:any={organizationId:org,status:{not:'CLOSED'}};const violationWhere:any={organizationId:org,status:{not:'CLOSED'}};
 if(supervisor){employeeWhere.id={in:visibleIds};attendanceWhere.employeeId={in:visibleIds};eventWhere.employeeId={in:visibleIds};violationWhere.employeeId={in:visibleIds};}
 const [employees,attendance,visitors,visitorsToday,events,violations,alerts,cameras,camerasTotal,recent]=await Promise.all([
  db.employee.count({where:employeeWhere}),db.attendanceRecord.findMany({where:attendanceWhere,orderBy:{occurredAt:'asc'}}),
  supervisor?0:db.visitor.count({where:{organizationId:org,checkedOutAt:null}}),supervisor?0:db.visitor.count({where:{organizationId:org,checkedInAt:{gte:start,lt:end}}}),
  db.securityEvent.count({where:eventWhere}),db.violation.count({where:violationWhere}),supervisor?0:db.alert.count({where:{organizationId:org,status:'NEW'}}),
  supervisor?0:db.camera.count({where:{organizationId:org,status:'ONLINE'}}),supervisor?0:db.camera.count({where:{organizationId:org}}),
  supervisor?[]:db.auditLog.findMany({where:{organizationId:org},include:{user:{select:{name:true}}},orderBy:{createdAt:'desc'},take:8})
 ]);
 const inside=new Set<string>();for(const row of attendance){if(row.kind==='CHECK_IN')inside.add(row.employeeId);else inside.delete(row.employeeId);}
 const chart=Array.from({length:24},(_,hour)=>({hour:`${String(hour).padStart(2,'0')}:00`,count:attendance.filter(r=>Number(new Intl.DateTimeFormat('en-GB',{timeZone:tz,hour:'2-digit',hourCycle:'h23'}).format(r.occurredAt))===hour).length}));
 return NextResponse.json({employees:security?0:employees,present:security?0:inside.size,absent:security?0:Math.max(0,employees-inside.size),visitors:hr?0:visitors,visitorsToday:hr?0:visitorsToday,events:hr?0:events,violations:hr?0:violations,alerts:hr?0:alerts,camerasOnline:hr?0:cameras,camerasTotal:hr?0:camerasTotal,chart:security?[]:chart,recent});
}
