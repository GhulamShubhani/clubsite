"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

type Team = {
  id: string;
  name: string;
  tag: string | null;
  game: string | null;
};

type Player = {
  id: string;
  name: string;
  gamertag: string | null;
  role: string | null;
  teamId: string | null;
  avatarUrl: string | null;
  stats: Record<string, unknown> | null;
  team?: Team | null;
};

const playersEndpoint = "/api/gaming/players";
const teamsEndpoint = "/api/gaming/teams";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [query, setQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [playersRes, teamsRes] = await Promise.all([
        fetch(playersEndpoint),
        fetch(teamsEndpoint),
      ]);
      const playersData = await playersRes.json();
      const teamsData = await teamsRes.json();
      if (!playersRes.ok) throw new Error(playersData.error ?? "Failed to load players");
      if (!teamsRes.ok) throw new Error(teamsData.error ?? "Failed to load teams");
      setPlayers((playersData.players as Player[]) ?? []);
      setTeams((teamsData.teams as Team[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roster");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [load]);

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const statsText = String(form.get("stats") ?? "").trim();
    let stats: Record<string, unknown> | null = null;
    if (statsText) {
      try {
        const parsed: unknown = JSON.parse(statsText);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Stats must be a JSON object");
        }
        stats = parsed as Record<string, unknown>;
      } catch {
        setError("Stats must be valid JSON, for example: {\"kd\": \"1.2\", \"rank\": \"Diamond\"}");
        setSaving(false);
        return;
      }
    }

    const body = {
      name: String(form.get("name") ?? "").trim(),
      gamertag: String(form.get("gamertag") ?? "").trim() || null,
      role: String(form.get("role") ?? "").trim() || null,
      teamId: String(form.get("teamId") ?? "").trim() || null,
      avatarUrl: String(form.get("avatarUrl") ?? "").trim() || null,
      stats,
    };

    try {
      const res = await fetch(playersEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create player");
      event.currentTarget.reset();
      setMessage("Player added to the roster.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create player");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Remove this player from the roster?")) return;
    setError(null);
    try {
      const res = await fetch(`${playersEndpoint}/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to remove player");
      setPlayers((current) => current.filter((player) => player.id !== id));
      setMessage("Player removed from the roster.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove player");
    }
  }

  const visiblePlayers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return players.filter((player) => {
      const matchesTeam =
        teamFilter === "all" ||
        (teamFilter === "free" ? !player.teamId : player.teamId === teamFilter);
      const matchesQuery =
        !normalized ||
        [player.name, player.gamertag, player.role, player.team?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalized));
      return matchesTeam && matchesQuery;
    });
  }, [players, query, teamFilter]);

  const assignedCount = players.filter((player) => player.teamId).length;
  const roles = new Set(players.map((player) => player.role).filter(Boolean)).size;

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Competitive roster
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">Players</h1>
          <p className="mt-2 text-sm text-zinc-600">
            Build your roster with player profiles, roles, teams, avatars, and performance stats.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((open) => !open)}
          className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-zinc-950/15 transition hover:-translate-y-0.5 hover:bg-zinc-800"
        >
          {showForm ? "Hide player form" : "+ Add player"}
        </button>
      </div>

      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Total players", players.length, "Everyone in your roster"],
          ["Assigned to teams", assignedCount, "Players with a squad"],
          ["Roles represented", roles, "Unique positions"],
        ].map(([label, value, hint]) => (
          <div key={String(label)} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-zinc-950">{value}</p>
            <p className="mt-1 text-xs text-zinc-500">{hint}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={onCreate} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-emerald-950 via-teal-900 to-cyan-900 px-5 py-5 text-white sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">New player profile</p>
            <h2 className="mt-1 text-xl font-bold">Add a player to your club</h2>
            <p className="mt-1 text-sm text-teal-100">Create the profile now and enrich it with stats whenever you need.</p>
          </div>
          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-7">
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Full name <span className="text-rose-500">*</span></span>
              <input name="name" required placeholder="e.g. Alex Morgan" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Gamertag</span>
              <input name="gamertag" placeholder="e.g. Nova#123" className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Role</span>
              <input name="role" placeholder="IGL, Entry, Support..." className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Team</span>
              <select name="teamId" className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
                <option value="">Free agent / no team</option>
                {teams.map((team) => <option key={team.id} value={team.id}>{team.name}{team.tag ? ` · ${team.tag}` : ""}</option>)}
              </select>
              {teams.length === 0 ? <span className="mt-1 block text-xs text-amber-600">Create a team first to assign this player.</span> : null}
            </label>
            <label>
              <span className="mb-2 block text-sm font-semibold text-zinc-800">Avatar URL</span>
              <input name="avatarUrl" type="url" placeholder="https://..." className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <label>
              <span className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-800">
                Player stats <span className="text-xs font-normal text-zinc-400">optional JSON</span>
              </span>
              <input name="stats" placeholder='{"rank":"Diamond","kd":"1.2"}' className="w-full rounded-xl border border-zinc-200 px-4 py-3 font-mono text-xs outline-none placeholder:text-zinc-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
            </label>
            <div className="flex items-center justify-between gap-4 sm:col-span-2">
              <p className="text-xs text-zinc-500">You can add a public avatar from any image URL.</p>
              <button type="submit" disabled={saving} className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-60">
                {saving ? "Adding…" : "Add player"}
              </button>
            </div>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-zinc-950">Roster directory</h2>
            <p className="mt-1 text-sm text-zinc-500">Search by name, gamertag, role, or team.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roster..." className="w-52 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100" />
            <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700 outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100">
              <option value="all">All teams</option>
              <option value="free">Free agents</option>
              {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center text-sm text-zinc-500">Loading roster…</div>
        ) : visiblePlayers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-600">♙</div>
            <h3 className="mt-4 font-semibold text-zinc-900">{query || teamFilter !== "all" ? "No matching players" : "Your roster is empty"}</h3>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-500">{query || teamFilter !== "all" ? "Try changing your search or filter." : "Add your first player to start building your competitive roster."}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visiblePlayers.map((player) => (
              <article key={player.id} className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg">
                <div className="h-2 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500" />
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    {player.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.avatarUrl} alt="" className="h-14 w-14 rounded-2xl object-cover ring-4 ring-emerald-50" />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-sm font-bold text-emerald-700 ring-4 ring-emerald-50">{initials(player.name)}</div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-zinc-950">{player.name}</h3>
                      <p className="mt-1 truncate text-sm font-medium text-emerald-700">{player.gamertag || "No gamertag"}</p>
                    </div>
                    {player.role ? <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-zinc-600">{player.role}</span> : null}
                  </div>
                  <div className="mt-5 rounded-xl bg-zinc-50 px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">Team</p>
                    <p className="mt-1 text-sm font-semibold text-zinc-800">{player.team?.name || "Free agent"}</p>
                    {player.team?.game ? <p className="mt-0.5 text-xs text-zinc-500">{player.team.game}</p> : null}
                  </div>
                  {player.stats && Object.keys(player.stats).length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(player.stats).slice(0, 3).map(([key, value]) => (
                        <span key={key} className="rounded-md border border-zinc-200 px-2 py-1 text-[10px] text-zinc-600"><strong className="text-zinc-800">{key}:</strong> {String(value)}</span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-5 flex justify-end border-t border-zinc-100 pt-3">
                    <button type="button" onClick={() => void onDelete(player.id)} className="text-xs font-semibold text-zinc-400 transition hover:text-rose-600">Remove player</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
