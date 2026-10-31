import test from 'node:test';
import assert from 'node:assert/strict';
import {allows} from '../src/lib/permissions.ts';

test('super admin can read, write, and delete all organization resources',()=>{
 const role={key:'SUPER_ADMIN',permissions:[]};
 for(const action of ['read','write','delete'])assert.equal(allows(role,'cameras',action),true);
});
test('HR can manage attendance and employees but cannot write security events',()=>{
 const role={key:'HR_MANAGER',permissions:[]};
 assert.equal(allows(role,'employees','write'),true);
 assert.equal(allows(role,'attendance','write'),true);
 assert.equal(allows(role,'events','write'),false);
 assert.equal(allows(role,'employees','delete'),false);
});
test('security officer can manage visitor and alert records but cannot see HR files',()=>{
 const role={key:'SECURITY_OFFICER',permissions:[]};
 assert.equal(allows(role,'visitors','write'),true);
 assert.equal(allows(role,'alerts','write'),true);
 assert.equal(allows(role,'employees','read'),false);
});
test('viewer is read-only and custom grants apply to a single action',()=>{
 assert.equal(allows({key:'VIEWER',permissions:[]},'events','read'),true);
 assert.equal(allows({key:'VIEWER',permissions:[]},'events','write'),false);
 assert.equal(allows({key:'CUSTOM',permissions:['cameras:write']},'cameras','write'),true);
 assert.equal(allows({key:'CUSTOM',permissions:['cameras:write']},'cameras','read'),true);
 assert.equal(allows({key:'CUSTOM',permissions:['cameras:write']},'cameras','delete'),false);
});
test('new HR modules are permitted while unrelated camera data stays restricted',()=>{
 const hr={key:'HR_MANAGER',permissions:[]};
 assert.equal(allows(hr,'leaves','write'),true);
 assert.equal(allows(hr,'shifts','write'),true);
 assert.equal(allows(hr,'cameras','read'),false);
});
test('supervisor has no organization-wide visitor, alert, user, or camera access',()=>{
 const supervisor={key:'SUPERVISOR',permissions:[]};
 for(const resource of ['visitors','alerts','users','cameras'])assert.equal(allows(supervisor,resource,'read'),false);
 assert.equal(allows(supervisor,'attendance','read'),true);
});
