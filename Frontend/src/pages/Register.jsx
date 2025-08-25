import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import '../styles/register.css'
import axios from 'axios'

const Register = () => {
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const navigate = useNavigate()


	const submit = async (e) => {
		e.preventDefault()
		setError(null)
		setLoading(true)
		console.log(email, password,firstName,lastName)

		axios.post('http://localhost:3000/api/auth/register',{
			email: email,
			fullName:{
				firstName: firstName,
				lastName: lastName
			},
			password: password,
			
		},{
			withCredentials: true
		})

		try {
			navigate('/')
		} catch (err) {
			setError(err.message)
			navigate('/login')
		} finally {
			setLoading(false)
		}
	}

	return (
		<main className="auth-page">
			<section className="auth-card" aria-labelledby="register-heading">
				<header className="auth-header">
					<h1 id="register-heading" className="auth-title">Create account</h1>
					<p className="auth-sub">Start your journey — it's free and quick.</p>
				</header>

				<form className="form" onSubmit={submit} noValidate>
					<div className="name-row">
						<div className="field">
							<label className="label" htmlFor="firstName">First name</label>
							<input id="firstName" className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
						</div>
						<div className="field">
							<label className="label" htmlFor="lastName">Last name</label>
							<input id="lastName" className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
						</div>
					</div>

					<div className="field">
						<label className="label" htmlFor="email">Email</label>
						<input id="email" className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
					</div>

					<div className="field">
						<label className="label" htmlFor="password">Password</label>
						<input id="password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
					</div>

					<button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>

					{error && <div className="error">{error}</div>}
				</form>

				<p className="muted-row">Already have an account? <Link className="link" to="/login">Sign in</Link></p>
			</section>
		</main>
	)
}

export default Register
