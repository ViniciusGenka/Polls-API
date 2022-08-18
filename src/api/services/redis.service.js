const Redis = require("redis");
const client = Redis.createClient();

const setKeyValuePairWithExpirationTime = async (key, value, options) => {
  try {
    await client.connect();
    await client.set(key, value, options);
    await client.disconnect();
  } catch (err) {
    await client.disconnect();
    throw new Error("Something went wrong");
  }
};

const checkIfKeyExists = async (key) => {
  try {
    await client.connect();
    const response = await client.exists(key, (err, response) => {
      if (err) {
        throw new Error("Something went wrong");
      }
      if (response === 1) return true;
      if (response !== 1) return false;
    });
    await client.disconnect();
    return response;
  } catch (err) {
    await client.disconnect();
    throw new Error("Something went wrong");
  }
};

module.exports = { setKeyValuePairWithExpirationTime, checkIfKeyExists };
