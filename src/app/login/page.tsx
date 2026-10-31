import {redirect} from 'next/navigation'; import {getActor} from '@/lib/auth'; import Login from '@/components/Login';
export default async function LoginPage(){if(await getActor())redirect('/');return <Login/>}
