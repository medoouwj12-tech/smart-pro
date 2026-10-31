import {redirect} from 'next/navigation'; import {getActor} from '@/lib/auth'; import Dashboard from '@/components/Dashboard';
export default async function Home(){const actor=await getActor();if(!actor)redirect('/login');return <Dashboard userName={actor.name} organization={actor.organization.name} timezone={actor.organization.timezone}/>}
