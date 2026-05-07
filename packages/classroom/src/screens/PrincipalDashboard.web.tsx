import PrincipalDashboardWeb from "@repo/admin/screens/PrincipalDashboard.web";
import { DashboardContent } from "@repo/admin/screens/principal/DashboardContent";
import type { ComponentType } from "react";
import CreateSchoolModal from "../components/CreateSchoolModal";

type Props = {
	PrincipalOnboardingViewComponent: ComponentType<any>;
	CreateClassroomModalComponent: ComponentType<any>;
};

export default function PrincipalDashboardWebSurface({
	PrincipalOnboardingViewComponent,
	CreateClassroomModalComponent,
}: Props) {
	return (
		<PrincipalDashboardWeb
			DashboardContentComponent={DashboardContent}
			PrincipalOnboardingViewComponent={PrincipalOnboardingViewComponent}
			CreateSchoolModalComponent={CreateSchoolModal as any}
			CreateClassroomModalComponent={CreateClassroomModalComponent}
		/>
	);
}
