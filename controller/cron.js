const env = require('../constants');

test();

var test = function() {
    try {
      res.send("Cron 1 Working");
      trial_cron = env.cron.schedule('0 0 * * *', () => {
  
        console.log('Running a job at 12:00 AM everyday');
  
      });
    } catch (error) {
      console.log(error);
    }
}

