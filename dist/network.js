import { getLastSlug } from "./helpers.js";
const baseUrl = "https://learn.reboot01.com";
export function login(username, password) {
    const base64Data = btoa(`${username}:${password}`);
    const requestOptions = {
        method: "POST",
        headers: {
            Authorization: `Basic ${base64Data}`,
        },
    };
    return new Promise((resolve, reject) => {
        fetch(`${baseUrl}/api/auth/signin`, requestOptions)
            .then(async (response) => {
            if (response.status === 200) {
                return response.text();
            }
            else {
                const error = await response.json();
                reject(error.error ||
                    `could not login: ${response.status} ${response.statusText}`);
                return;
            }
        })
            .then((jwt) => {
            if (!jwt || jwt.trim() == "") {
                reject(`invalid jwt received: ${jwt}`);
                return;
            }
            // JWT arrived surronded by quotes, so we remove them
            localStorage.setItem("hasura-jwt", jwt.replaceAll('"', ""));
            resolve();
        });
    });
}
export async function logout() {
    const data = {
        headers: {
            "x-jwt-token": localStorage.getItem("hasura-jwt") || "",
        },
        method: "GET",
    };
    await fetch(`${baseUrl}/api/auth/expire`, data);
    data.method = "POST";
    await fetch(`${baseUrl}/api/auth/signout`, data);
    localStorage.removeItem("hasura-jwt");
}
export async function getTitleData(userId) {
    const query = `
        query GetTitleData($userId: Int) {
            event_user(where: { userId: { _eq: $userId }, eventId: { _eq: 20 } }) {
                level
            }
            user(where: { id: { _eq: $userId } }) {
                firstName
            }
        }
    `;
    const variables = { userId };
    return new Promise((resolve, reject) => {
        fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            },
            body: JSON.stringify({ query, variables }),
        })
            .then((response) => {
            if (response.status !== 200) {
                reject(`could not get title data: ${response.status} ${response.statusText}`);
                return;
            }
            return response.json();
        })
            .then((data) => {
            if (data.errors) {
                reject(`could not get title data: ${data.errors[0].message}`);
                return;
            }
            if (data.data.user.length === 0 || data.data.event_user.length === 0) {
                reject(`user not found`);
                return;
            }
            resolve({
                firstName: data.data.user[0].firstName,
                level: data.data.event_user[0].level,
            });
        });
    });
}
export async function getAuditData(userId) {
    const query = `
        query User($userId: Int) {
            user(where: { id: { _eq: $userId } }) {
                auditRatio
                totalDown
                totalUp
            }
        }
    `;
    const variables = { userId };
    return new Promise((resolve, reject) => {
        fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            },
            body: JSON.stringify({ query, variables }),
        })
            .then((response) => {
            if (response.status !== 200) {
                reject(`could not get audit data: ${response.status} ${response.statusText}`);
                return;
            }
            return response.json();
        })
            .then((data) => {
            if (data.errors) {
                reject(`could not get auidt data: ${data.errors[0].message}`);
                return;
            }
            if (data.data.user.length === 0) {
                reject(`user not found`);
                return;
            }
            resolve({
                ...data.data.user[0],
            });
        });
    });
}
export async function getLatestFinishedAudit(userId) {
    const query = `
        query Audit($userId: Int) {
            audit(
                where: { auditorId: { _eq: $userId }, grade: { _is_null: false } }
                limit: 1
                order_by: {endAt: desc}
            ) {
                grade
                group {
                    captainLogin
                    path
                }
            }
        }
    `;
    const variables = { userId };
    return new Promise((resolve, reject) => {
        fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            },
            body: JSON.stringify({ query, variables }),
        })
            .then((response) => {
            if (response.status !== 200) {
                reject(`could not get last audit data: ${response.status} ${response.statusText}`);
                return;
            }
            return response.json();
        })
            .then((data) => {
            if (data.errors) {
                reject(`could not get last audit data: ${data.errors[0].message}`);
                return;
            }
            if (data.data.audit.length === 0) {
                reject(`audit not found`);
                return;
            }
            resolve({
                projectName: getLastSlug(data.data.audit[0].group.path),
                captain: data.data.audit[0].group.captainLogin,
                didPass: data.data.audit[0].grade >= 1,
            });
        });
    });
}
export async function getLatestFinishedProject(userId) {
    const query = `
        query Group($userId: Int) {
            group(
                where: {
                    members: { userId: { _eq: $userId } }
                    eventId: { _eq: 20 }
                    status: { _eq: finished }
                }
                limit: 1
                order_by: {updatedAt: desc}
            ) {
                path
            }
        }
    `;
    const variables = { userId };
    return new Promise((resolve, reject) => {
        fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            },
            body: JSON.stringify({ query, variables }),
        })
            .then((response) => {
            if (response.status !== 200) {
                reject(`could not get last group data: ${response.status} ${response.statusText}`);
                return;
            }
            return response.json();
        })
            .then((data) => {
            if (data.errors) {
                reject(`could not get last group data: ${data.errors[0].message}`);
                return;
            }
            if (data.data.group.length === 0) {
                reject(`group not found`);
                return;
            }
            resolve(getLastSlug(data.data.group[0].path));
        });
    });
}
export async function getXpForProjects(userId) {
    const query = `
        query Transaction($userId: Int) {
            transaction(
                where: { eventId: { _eq: 20 }, userId: { _eq: $userId }, type: { _eq: "xp" } }
                order_by: {createdAt: desc}
            ) {
                amount
                createdAt
                path
            }
        }
    `;
    const variables = { userId };
    return new Promise((resolve, reject) => {
        fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            },
            body: JSON.stringify({ query, variables }),
        })
            .then((response) => {
            if (response.status !== 200) {
                reject(`could not get transactions data: ${response.status} ${response.statusText}`);
                return;
            }
            return response.json();
        })
            .then((data) => {
            if (data.errors) {
                reject(`could not get transactions data: ${data.errors[0].message}`);
                return;
            }
            if (data.data.transaction.length === 0) {
                reject(`no transactions found`);
                return;
            }
            resolve(data.data.transaction.map((t) => ({
                amount: t.amount,
                name: getLastSlug(t.path),
            })));
        });
    });
}
const GET_WORKING_ON = `
query ($userId: Int!) {
  workingGroup: group(
    where: {members: {userId: {_eq: $userId}}, path: {_neq: "/bahrain/bh-module/social-network"}, status: {_in: [working]}, _not: {pathByPath: {path_archives: {status: {_eq: deleted}}}}}
  ) {
    path
    updatedAt
    event {
      registrationId
    }
  }
}`;
const GET_SKILLS = `
query test($userId: Int) {
  user(where: {id: {_eq: $userId}}) {
    transactions(
      order_by: [{type: desc}, {amount: desc}]
      distinct_on: [type]
      where: {userId: {_eq: $userId}, type: {_in: ["skill_js", "skill_go", "skill_html", "skill_prog", "skill_front-end", "skill_back-end"]}}
    ) {
      type
      amount
    }
  }
}`;
const GET_AUDITS = `
query GetAudits($userId: Int!) {
  audit(
    distinct_on: [resultId]
    where: {_or: [{auditorId: {_eq: $userId}}, {group: {members: {userId: {_eq: $userId}}}}], _and: [{_or: [{_and: [{resultId: {_is_null: true}}, {grade: {_is_null: true}}]}, {grade: {_is_null: false}}]}]}
    order_by: [{resultId: desc}]
  ) {
    grade
    endAt
    group {
      captainLogin
      path
    }
    resultId
  }
}
`;
const GET_EVENTS_BY_PATHS = `
  query GetEventsByPaths($paths: [String!]) {
    event(where: { id: { _eq: 20 } }) {
      xps(where: { path: { _in: $paths } }) {
          amount
          path
      }
  }
  }
`;
export async function getSkills(userId) {
    const skillsData = await fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: GET_SKILLS, variables: { userId } }),
    });
    if (!skillsData.ok) {
        throw new Error(`Could not fetch audits: ${skillsData.status} ${skillsData.statusText}`);
    }
    const auditData = await skillsData.json();
    if (auditData.errors) {
        throw new Error(`Could not fetch audits: ${auditData.errors[0].message}`);
    }
    const transactions = auditData.data.user[0].transactions;
    // Sort transactions by amount in descending order
    transactions.sort((a, b) => b.amount - a.amount);
    return transactions;
}
export async function getAuditsWithEvents(userId) {
    // Fetch audits
    const auditResponse = await fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: GET_AUDITS, variables: { userId } }),
    });
    if (!auditResponse.ok) {
        throw new Error(`Could not fetch audits: ${auditResponse.status} ${auditResponse.statusText}`);
    }
    const auditData = await auditResponse.json();
    if (auditData.errors) {
        throw new Error(`Could not fetch audits: ${auditData.errors[0].message}`);
    }
    const audits = auditData.data.audit;
    if (audits.length === 0) {
        return [];
    }
    // Fetch events for each path
    const paths = audits.map((audit) => audit.group.path);
    const eventsResponse = await fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: GET_EVENTS_BY_PATHS,
            variables: { paths },
        }),
    });
    if (!eventsResponse.ok) {
        throw new Error(`Could not fetch events: ${eventsResponse.status} ${eventsResponse.statusText}`);
    }
    const eventsData = await eventsResponse.json();
    if (eventsData.errors) {
        throw new Error(`Could not fetch events: ${eventsData.errors[0].message}`);
    }
    // Combine audits with their associated events
    const auditsWithEvents = audits.map((audit) => ({
        ...audit,
        xpGained: MyTest(eventsData.data.event[0].xps, audit.group.path),
    }));
    return auditsWithEvents;
}
function MyTest(paths, key) {
    const result = paths.find(({ path }) => path === key);
    return result ? result.amount : 0;
}
export async function getWorkingOn(userId) {
    const workingOnData = await fetch(`${baseUrl}/api/graphql-engine/v1/graphql`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("hasura-jwt")}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            query: GET_WORKING_ON,
            variables: { userId },
        }),
    });
    if (!workingOnData.ok) {
        throw new Error(`Could not fetch audits: ${workingOnData.status} ${workingOnData.statusText}`);
    }
    const currentProject = await workingOnData.json();
    if (currentProject.errors) {
        throw new Error(`Could not fetch audits: ${currentProject.errors[0].message}`);
    }
    return currentProject;
}
//# sourceMappingURL=network.js.map