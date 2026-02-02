// 1. Import the "Lego brick" (our Fastify "telephone")
const fastify = require('fastify')({
  logger: true // Tell it to "log" (print) its activity to our terminal
});

// 2. Create our *first* "menu item" (a "route")
// When someone "visits" our "brain" at the "front door" (/),
// we will send them a "Hello World" message.
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// 3. "Turn on" the "brain" and tell it to "listen" for "phone calls"
const start = async () => {
  try {
    // We'll tell it to "listen" on "port" 3001
    // (Our website will be on 3000, our "brain" on 3001)
    await fastify.listen({ port: 3001 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();