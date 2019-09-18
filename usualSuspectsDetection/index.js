const Client = require('azure-iothub').Client;

const database = {
    'Javi' : true,
    'Fernando' : false,
    'Robert' : false,
    'Abril' : true
};

module.exports = function (context, ioTHubMessages) {
    //context.log(`JavaScript eventhub trigger function called for message array: ${JSON.stringify(ioTHubMessages)}.`);
    
    if (ioTHubMessages.length > 0) {
        const msgTimestamp = ioTHubMessages[0].timestamp;
        const now = new Date().getTime();
        if (now - msgTimestamp > 1000*60*10) {
            context.log('Skipping messages older than ten minutes.');
            context.done();
            return;
        }
    }

    function invokeSetVisualAlarmState(usualSuspects) {
        const deviceId = process.env.DEVICE_NAME ? process.env.DEVICE_NAME : 'drone1';
        const moduleName = 'FaceAPIServerModule';
        const methodName = 'SetVisualAlarmState';
        
        context.log(`Connecting to IotHub.`);
        const connectionString = process.env.IOTHUB_CONNECTION_STRING;
        // const connectionString = 'HostName=policehub.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=<key>';

        const client = Client.fromConnectionString(connectionString);
        context.log(`Connection stablished.`);

        context.log(`Invoking method.`);
        const methodParams = {
            methodName: methodName,
            payload: { 
                usualSuspects : usualSuspects,
                "desiredAlarmState" : usualSuspects.dangerous.length > 0 
            },
            responseTimeoutInSeconds: 120,
            connectTimeoutInSeconds : 120
        };

        client.invokeDeviceMethod(deviceId, moduleName, methodParams, function (err, result) {
            if (err) {
                context.error('Failed to invoke method \'' + methodName + '\': ' + err.message);
            } else {
                context.log(methodName + ' on ' + deviceId + ':');
                context.log(JSON.stringify(result, null, 2));
            }
            context.log(`All done here.`);
            context.done();
        });    
    }
    
    const usualSuspects = {
        dangerous : [],
        harmless : []
    };
    ioTHubMessages.forEach(message => {
        message.matches.forEach(match => {
            const alarmDesiredState = database[match._label];
            if (alarmDesiredState === true) {
                if (usualSuspects.dangerous.includes(match._label) === false) {
                    usualSuspects.dangerous.push(match._label);
                }
            } else {
                if (usualSuspects.harmless.includes(match._label) === false) {
                    usualSuspects.harmless.push(match._label);
                }
            }
        })
        context.log(`Processed message: ${JSON.stringify(message)}`);
    });
    if (usualSuspects.length > 0) {
        invokeSetVisualAlarmState(usualSuspects);
    } else {
        context.done();
    }
};