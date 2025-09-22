import ShadcnAuthForm from '../../components/ui/ShadcnAuthForm'

export default function AdminLogin() {
    return (
        <ShadcnAuthForm mode="login" admin={true} />
    )
}
