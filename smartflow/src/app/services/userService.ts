import { log } from "console";
import API from "../utils/axios";
import { extractId, formatPrefixedId } from "../helper/formatUid";
import { getCurrentTimestamp } from "../helper/currentTime";
interface BackendUser {
  application_id: number;
  user_id: number;
  full_name: string;
  email: string;
  user_status: string;
  application_status: string;
  submitted_by: string;
  hr_reviewed_by: string | null;
  reviewed_at: string | null;
  department: string; 
}

export interface UpdateStatus {
  id: string;
  status: "approved" | "rejected";
  hr_reviewed_by: number;
  reviewed_at: string;
}


interface AccessRequest {
  id: string;
  employee: string;
  requestedBy: string;
  systems: string[];
  status: string;
  created: string;
  department: string;
}

const departmentSystems: Record<string, string[]> = {
  "Human Resources": ["HR System", "Payroll"],
  it_staff: ["IT panel", "Network Access"],
  Finance: ["Financial System", "Reporting"]
};

export async function getSystemUsers(): Promise<AccessRequest[]> {
  try {
    const response = await API.get("/api/users/dir");
    const backendUsers: BackendUser[] = response.data.users;
    console.log(backendUsers)

    const accessRequests: AccessRequest[] = backendUsers.map((user) => {
      const department = user.department || "it_staff";
      const systems = departmentSystems[department] || ["General Dashboard"];

      return {
        id: formatPrefixedId("AR", user.application_id),
        employee: user.full_name,
        requestedBy: user.submitted_by,
        systems,
        status: user.application_status,
        created: new Date().toISOString().slice(0, 10), // Placeholder date
        department
      };
    });
    return accessRequests;
  } catch (error) {
    console.error("Error fetching system users:", error);
    return [];
  }
}

export async function applicationReview(userData: UpdateStatus, action : string): Promise<any> {
  try {
    const uid_unextracted = userData.id;
    const reviewedAt = getCurrentTimestamp();

    const application_id = extractId(uid_unextracted,"AR");
    const newStatus = {id : application_id, status : action,reviewed_by : 4, reviewed_at : reviewedAt}
    console.log(`ready to bounce ${application_id} ${action}`)
    const resp = await API.post("/api/application/review", newStatus);
    console.log(resp.data)
    return resp.data;
  } catch (error: any) {
    console.error("Failed to update application:", error);
    throw error.response?.data || error;
  }
}

