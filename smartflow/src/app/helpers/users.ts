import API from "../utils/axios";
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
  department: string; // Make sure your backend includes this, if renamed from `role`
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
        id: `AR${String(user.application_id).padStart(3, "0")}`,
        employee: user.full_name,
        requestedBy: user.submitted_by,
        systems,
        status: user.application_status,
        created: new Date().toISOString().slice(0, 10), // Placeholder date
        department
      };
    });
    console.log("test 001",backendUsers)
        console.log("test 002",accessRequests)

    return accessRequests;
  } catch (error) {
    console.error("Error fetching system users:", error);
    return [];
  }
}
