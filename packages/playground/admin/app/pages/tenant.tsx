import { ChangeMyPasswordForm, CreateApiKeyForm, InviteForm } from '@contember/react-identity'
import { Card, CardContent, CardHeader, CardTitle } from '@app/lib/ui/card'
import { ApiKeyList, ChangeMyPasswordFormFields, CreateApiKeyFormFields, InviteFormFields, MemberListController, OtpSetup, PersonList } from '@app/lib/tenant'
import { ToastContent, useShowToast } from '@app/lib/toast'
import { useProjectSlug } from '@contember/react-client'
import { Input } from '@app/lib/ui/input'
import { useRef } from 'react'

export const Security = () => {
	const showToast = useShowToast()
	return (
		<div className="flex flex-col items-center gap-4">
			<Card className="w-[40rem] max-w-full">
				<CardHeader>
					<CardTitle className="text-2xl">Change Password</CardTitle>
				</CardHeader>
				<CardContent>
					<ChangeMyPasswordForm onSuccess={() => showToast(<ToastContent>Password changed</ToastContent>, { type: 'success' })}>
						<form className="grid gap-4">
							<ChangeMyPasswordFormFields />
						</form>
					</ChangeMyPasswordForm>
				</CardContent>
			</Card>
			<Card className="w-[40rem] max-w-full">
				<CardHeader>
					<CardTitle className="text-2xl">Two-factor setup</CardTitle>
				</CardHeader>
				<CardContent>
					<OtpSetup />
				</CardContent>
			</Card>
		</div>
	)
}


export const Members = () => {
	const projectSlug = useProjectSlug()!
	const showToast = useShowToast()
	const memberListController = useRef<MemberListController>()
	return (
		<div className="grid md:grid-cols-2 gap-4">
			<div>
				<Card className="w-[40rem] max-w-full">
					<CardHeader>
						<CardTitle className="text-2xl">Members</CardTitle>
					</CardHeader>
					<CardContent>
						<PersonList controller={memberListController} />
					</CardContent>
				</Card>
			</div>
			<div>
				<Card className="w-[40rem] max-w-full">
					<CardHeader>
						<CardTitle className="text-2xl">Invite</CardTitle>
					</CardHeader>
					<CardContent>
						<InviteForm
							projectSlug={projectSlug}
							initialMemberships={[{ role: 'admin', variables: [] }]}
							onSuccess={args => {
								showToast(<ToastContent>Invitation sent to {args.result.person?.email}</ToastContent>, { type: 'success' })
								memberListController.current?.refresh()
							}}
						>
							<form className="grid gap-4">
								<InviteFormFields projectSlug={projectSlug} />
							</form>
						</InviteForm>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}

export const ApiKeys = () => {
	const projectSlug = useProjectSlug()!
	const showToast = useShowToast()
	const memberListController = useRef<MemberListController>()
	return (
		<div className="grid md:grid-cols-2 gap-4">
			<div>
				<Card className="w-[40rem] max-w-full">
					<CardHeader>
						<CardTitle className="text-2xl">API keys</CardTitle>
					</CardHeader>
					<CardContent>
						<ApiKeyList controller={memberListController} />
					</CardContent>
				</Card>
			</div>
			<div>
				<Card className="w-[40rem] max-w-full">
					<CardHeader>
						<CardTitle className="text-2xl">Create API key</CardTitle>
					</CardHeader>
					<CardContent>
						<CreateApiKeyForm
							projectSlug={projectSlug}
							initialMemberships={[{ role: 'admin', variables: [] }]}
							onSuccess={args => {
								showToast(<ToastContent title="API key created"><Input value={args.result.apiKey.token} type="text" /></ToastContent>, { type: 'success' })
								memberListController.current?.refresh()
							}}
						>
							<form className="grid gap-4">
								<CreateApiKeyFormFields projectSlug={projectSlug} />
							</form>
						</CreateApiKeyForm>
					</CardContent>

				</Card>
			</div>
		</div>
	)
}
