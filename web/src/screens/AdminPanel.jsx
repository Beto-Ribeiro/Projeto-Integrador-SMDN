import { useEffect, useMemo, useState } from 'react'
import {
  approveAccessRequest,
  listAccessRequests,
  listAuditLogs,
  listWebProfiles,
  rejectAccessRequest,
} from '../services/adminService'

const STATUS_LABEL = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  recusado: 'Recusado',
  banido: 'Banido',
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function StatusPill({ status }) {
  const styles = {
    pendente: 'bg-yellow-50 text-yellow-700 border-yellow-100',
    aprovado: 'bg-green-50 text-green-700 border-green-100',
    recusado: 'bg-red-50 text-red-700 border-red-100',
    banido: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.pendente}`}>
      {STATUS_LABEL[status] || status || 'Pendente'}
    </span>
  )
}

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('requests')
  const [requests, setRequests] = useState([])
  const [profiles, setProfiles] = useState([])
  const [logs, setLogs] = useState([])
  const [missingSchema, setMissingSchema] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadAdminData() {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const [requestsResult, profilesResult, logsResult] = await Promise.all([
        listAccessRequests(),
        listWebProfiles(),
        listAuditLogs(),
      ])

      setRequests(requestsResult.data)
      setProfiles(profilesResult.data)
      setLogs(logsResult.data)
      setMissingSchema(Boolean(requestsResult.missingSchema || logsResult.missingSchema))
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o painel administrativo.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
  }, [])

  const stats = useMemo(() => {
    const pending = requests.filter((item) => item.saw_status === 'pendente').length
    const approved = requests.filter((item) => item.saw_status === 'aprovado').length
    const rejected = requests.filter((item) => item.saw_status === 'recusado').length

    return { pending, approved, rejected, profiles: profiles.length, logs: logs.length }
  }, [requests, profiles, logs])

  async function handleApprove(request) {
    setActionLoading(request.saw_id)
    setError('')
    setMessage('')

    try {
      await approveAccessRequest(request.saw_id)
      setMessage('Solicitação aprovada.')
      await loadAdminData()
    } catch (err) {
      setError(err.message || 'Não foi possível aprovar a solicitação.')
    } finally {
      setActionLoading('')
    }
  }

  async function handleReject(request) {
    setActionLoading(request.saw_id)
    setError('')
    setMessage('')

    try {
      await rejectAccessRequest(request.saw_id, 'Recusado pelo painel administrativo.')
      setMessage('Solicitação recusada.')
      await loadAdminData()
    } catch (err) {
      setError(err.message || 'Não foi possível recusar a solicitação.')
    } finally {
      setActionLoading('')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bg-sidebar/70">Administração</p>
        <h1 className="text-3xl font-bold text-slate-800">Painel do Administrador</h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Área restrita para revisar solicitações de acesso web, acompanhar perfis autorizados e consultar registros administrativos.
        </p>
      </div>

      {missingSchema && (
        <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-5 py-4 text-sm text-yellow-800 leading-relaxed">
          O front do painel já está pronto, mas as tabelas administrativas ainda não existem no Supabase.
          Use o arquivo <strong>docs/supabase-web-admin-access.sql</strong> quando você liberar a etapa de banco.
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 leading-relaxed">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700 leading-relaxed">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-card p-5 border border-border-soft">
          <p className="text-xs text-slate-400 font-semibold uppercase">Pendentes</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-border-soft">
          <p className="text-xs text-slate-400 font-semibold uppercase">Aprovados</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-border-soft">
          <p className="text-xs text-slate-400 font-semibold uppercase">Recusados</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.rejected}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-border-soft">
          <p className="text-xs text-slate-400 font-semibold uppercase">Perfis</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.profiles}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5 border border-border-soft">
          <p className="text-xs text-slate-400 font-semibold uppercase">Logs</p>
          <p className="text-2xl font-bold text-slate-800 mt-2">{stats.logs}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
        <div className="flex flex-wrap gap-2 border-b border-border-soft p-4">
          {[
            ['requests', 'Solicitações'],
            ['profiles', 'Perfis Web'],
            ['logs', 'Registros'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${activeTab === id ? 'bg-bg-sidebar text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {label}
            </button>
          ))}
          <button
            onClick={loadAdminData}
            className="ml-auto rounded-full px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          >
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-500">Carregando dados administrativos...</div>
        ) : activeTab === 'requests' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Solicitante</th>
                  <th className="px-5 py-3 text-left font-semibold">Instituição</th>
                  <th className="px-5 py-3 text-left font-semibold">Cargo</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Criado em</th>
                  <th className="px-5 py-3 text-right font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {requests.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-400">
                      Nenhuma solicitação encontrada.
                    </td>
                  </tr>
                )}
                {requests.map((request) => (
                  <tr key={request.saw_id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-700">{request.saw_nome}</p>
                      <p className="text-xs text-slate-400">{request.saw_email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{request.saw_instituicao || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{request.saw_cargo || '—'}</td>
                    <td className="px-5 py-4"><StatusPill status={request.saw_status} /></td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(request.saw_created_at)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={request.saw_status !== 'pendente' || actionLoading === request.saw_id}
                          onClick={() => handleApprove(request)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Aprovar
                        </button>
                        <button
                          disabled={request.saw_status !== 'pendente' || actionLoading === request.saw_id}
                          onClick={() => handleReject(request)}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Recusar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'profiles' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Nome</th>
                  <th className="px-5 py-3 text-left font-semibold">Tipo</th>
                  <th className="px-5 py-3 text-left font-semibold">ID</th>
                  <th className="px-5 py-3 text-left font-semibold">Criado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
                      Nenhum perfil encontrado.
                    </td>
                  </tr>
                )}
                {profiles.map((profile) => (
                  <tr key={profile.prf_id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-semibold text-slate-700">{profile.prf_nome || '—'}</td>
                    <td className="px-5 py-4 text-slate-600">{profile.prf_tipo || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{profile.prf_id}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(profile.prf_created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Ação</th>
                  <th className="px-5 py-3 text-left font-semibold">Entidade</th>
                  <th className="px-5 py-3 text-left font-semibold">Detalhes</th>
                  <th className="px-5 py-3 text-left font-semibold">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-soft">
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-slate-400">
                      Nenhum registro de auditoria encontrado.
                    </td>
                  </tr>
                )}
                {logs.map((log) => (
                  <tr key={log.log_id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-4 font-semibold text-slate-700">{log.action}</td>
                    <td className="px-5 py-4 text-slate-600">{log.entity_type || '—'}</td>
                    <td className="px-5 py-4 text-slate-500 max-w-lg truncate">{log.detail || '—'}</td>
                    <td className="px-5 py-4 text-slate-500">{formatDate(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
