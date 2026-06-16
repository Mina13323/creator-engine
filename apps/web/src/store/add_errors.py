import re

with open('src/store/useStore.ts', 'r', encoding='utf-8') as f:
    content = f.read()

if "import { useErrorStore }" not in content:
    content = "import { useErrorStore } from './errorStore';\n" + content

replacements = [
    (
        "console.error('analyzeFounder failed', e);",
        "useErrorStore.getState().addError({ title: 'AI Analysis Failed', message: e?.message || 'Could not analyze founder profile.', retryAction: () => get().analyzeFounder(projectId, data) });\n      console.error('analyzeFounder failed', e);"
    ),
    (
        "console.error('discoverOpportunities failed', e);",
        "useErrorStore.getState().addError({ title: 'Discovery Failed', message: e?.message || 'Could not discover opportunities.', retryAction: () => get().discoverOpportunities(projectId) });\n      console.error('discoverOpportunities failed', e);"
    ),
    (
        "console.error('selectOpportunity failed', e);",
        "useErrorStore.getState().addError({ title: 'Selection Failed', message: e?.message || 'Could not select opportunity.', retryAction: () => get().selectOpportunity(projectId, opportunityId) });\n      console.error('selectOpportunity failed', e);"
    ),
    (
        "console.error('generateBusinessPlan failed', e);",
        "useErrorStore.getState().addError({ title: 'Generation Failed', message: e?.message || 'Could not generate business plan.', retryAction: () => get().generateBusinessPlan(projectId) });\n      console.error('generateBusinessPlan failed', e);"
    ),
    (
        "console.error('generateBranding failed', e);",
        "useErrorStore.getState().addError({ title: 'Branding Engine Failed', message: e?.message || 'Could not generate branding.', retryAction: () => get().generateBranding(projectId) });\n      console.error('generateBranding failed', e);"
    ),
    (
        "console.error('generateMarketing failed', e);",
        "useErrorStore.getState().addError({ title: 'Marketing Engine Failed', message: e?.message || 'Could not generate marketing campaign.', retryAction: () => get().generateMarketing(projectId) });\n      console.error('generateMarketing failed', e);"
    ),
    (
        "console.error('generatePitch failed', e);",
        "useErrorStore.getState().addError({ title: 'Pitch Engine Failed', message: e?.message || 'Could not generate pitch deck.', retryAction: () => get().generatePitch(projectId) });\n      console.error('generatePitch failed', e);"
    ),
    (
        "console.error('uploadDocument failed', e);",
        "useErrorStore.getState().addError({ title: 'Upload Failed', message: e?.message || 'Could not upload document.' });\n      console.error('uploadDocument failed', e);"
    ),
    (
        "console.error('sendChatMessage failed', e);",
        "useErrorStore.getState().addError({ title: 'Chat Failed', message: e?.message || 'AI Cofounder could not respond.', retryAction: () => get().sendChatMessage(message) });\n      console.error('sendChatMessage failed', e);"
    )
]

for old, new in replacements:
    content = content.replace(old, new)

with open('src/store/useStore.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Added error store to useStore.ts")
