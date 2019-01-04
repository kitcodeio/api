const Docker = require('dockerode');
const docker = new Docker();

module.exports.startContainer = async (image_id) => {
  let image = await docker.getImage(image_id).inspect().catch(() => {});
  if (!image) return {
    statusCode: 500,
    error: 'image does not exist'
  };
  let container = await docker.createContainer({
    Image: image_id,
    Cmd: ['/bin/bash', '/kide/start.sh']
  });
  await container.start();
  return await container.inspect();
};

module.exports.stopContainer = async (container_id, image_id) => {
  let container = docker.getContainer(container_id);
  let data = await container.inspect();
  await container.stop();
  await container.commit({
    repo: data.Config.Hostname
  });
  await container.remove();
  if (image_id) docker.getImage(image_id).remove();
  return data;
};
