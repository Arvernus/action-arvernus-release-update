const { Toolkit } = require("actions-toolkit");
const zipDirectory = require("./zipDirectory");
const moveFiles = require("./moveFiles");
const uploadRelease = require("./uploadRelease");

Toolkit.run(
	async tools => {
		try {
			const packageName = tools.context.repo.repo;
			const workspace = tools.workspace;
			await moveFiles(`${workspace}/`, `${workspace}/${packageName}/`);

			tools.log.success("rsync done");

			await zipDirectory(
				`${workspace}/${packageName}`,
				`${workspace}/${packageName}.zip`
			);
			tools.log.success(
				`the zip file ${workspace}/${packageName}.zip has been created`
			);

			const {
				release: { name, body, prerelease, tag_name }
			} = tools.context.payload;

			const updatePackage = {
				releaseTitle: name,
				releaseNotes: body,
				isPrerelease: prerelease,
				packageName: packageName,
				packageVerson: tag_name,
				packageFile: `${workspace}/${packageName}.zip`
			};

			const response = await uploadRelease(updatePackage);
			tools.log.success(`${response.name} has been uploaded`);

			tools.exit.success(
				`Version ${response.version} of the Package ${
					response.name
				} has successfully been released.`
			);
		} catch (error) {
			tools.exit.failure(error);
		}
	},
	{
		secrets: ["ARVERNUS_SECRET_KEY"],
		event: "release"
	}
);