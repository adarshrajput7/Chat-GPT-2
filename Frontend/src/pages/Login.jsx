import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/login.css'
import axios from 'axios'

const Login = () => {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const submit = async (e) => {
		e.preventDefault()
		setError(null)
		setLoading(true)

        axios.post('http://localhost:3000/api/auth/login',{
            email: email,
            password: password
        },{
            withCredentials: true
        })
        
        .then((res)=>{
            console.log(res)
            navigate('/')
        })
        .catch((error)=>{
            console.log(error)
            setError('Login failed')
        })
        .finally(()=>{
            setLoading(false)
        })
	}

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="login-heading">
				<header className="auth-header">
					<h1 id="login-heading" className="auth-title">Sign in</h1>
					<p className="auth-sub">Sign in to your account to continue</p>
				</header>

				<form className="form" onSubmit={submit} noValidate>
					<div className="field">
						<label className="label" htmlFor="email">Email</label>
						<input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
					</div>

					<div className="field">
						<label className="label" htmlFor="password">Password</label>
						<input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
					</div>

					<button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>

					{error && <div className="error">{error}</div>}
				</form>

				<p className="muted-row">Don't have an account? <Link className="link" to="/register">Create one</Link></p>
			</section>
		</main>
	)
}

export default Login
