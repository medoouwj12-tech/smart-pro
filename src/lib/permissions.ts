export type RoleAccess={key:string;permissions:string[]};
const baseline:Record<string,{read:string[];write:string[]}>={
 HR_MANAGER:{read:['employees','attendance','leaves','departments','shifts','reports'],write:['employees','attendance','leaves','departments','shifts']},
 SECURITY_OFFICER:{read:['visitors','events','violations','alerts','cameras','logs','reports'],write:['visitors','events','violations','alerts']},
 SUPERVISOR:{read:['employees','attendance','events','violations','reports'] ,write:[]},
 VIEWER:{read:['employees','attendance','visitors','events','violations','alerts','cameras','reports','logs'],write:[]}
};
export function allows(role:RoleAccess,entity:string,action:'read'|'write'|'delete'){
 if(role.key==='SUPER_ADMIN'||role.permissions.includes('*'))return true;
 if(role.permissions.includes(`${entity}:${action}`))return true;
 if(action==='read'&&role.permissions.includes(`${entity}:write`))return true;
 if(action==='delete')return false;
 const rules=baseline[role.key]; return Boolean(rules?.[action].includes(entity));
}
