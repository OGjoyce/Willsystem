<?php
namespace App\Services;

use Google_Client;
use Google_Service_Calendar;
use Google_Service_Calendar_Event;
use Google_Service_Calendar_EventAttendee;
use Google_Service_Calendar_ConferenceData;
use Google_Service_Calendar_CreateConferenceRequest;
use Google_Service_Calendar_ConferenceSolutionKey;
use Illuminate\Support\Facades\Storage;

class GoogleCalendarService
{
    protected $client;

    public function __construct()
    {
        $this->client = new Google_Client();
        $this->client->setApplicationName('Google Calendar API Laravel');
        $this->client->setAuthConfig(storage_path('app/credentials.json'));
        $this->client->setScopes([Google_Service_Calendar::CALENDAR_EVENTS]);
        $this->client->setAccessType('offline');

        // Intentar cargar un token guardado
        if (Storage::exists('google-token.json')) {
            $accessToken = json_decode(Storage::get('google-token.json'), true);
            $this->client->setAccessToken($accessToken);

            // Si el token ha expirado, lo refrescamos automáticamente
            if ($this->client->isAccessTokenExpired()) {
                $this->client->fetchAccessTokenWithRefreshToken($this->client->getRefreshToken());
                Storage::put('google-token.json', json_encode($this->client->getAccessToken()));
            }
        }
    }

    public function getAuthUrl()
    {
        return $this->client->createAuthUrl();
    }

    public function authenticate($code)
    {
        $accessToken = $this->client->fetchAccessTokenWithAuthCode($code);
        $this->client->setAccessToken($accessToken);

        // Guardamos el token para evitar futuras autenticaciones manuales
        Storage::put('google-token.json', json_encode($accessToken));

        return $accessToken;
    }

    public function createEvent($summary, $description, $startDateTime, $endDateTime, $attendees)
    {
        $service = new Google_Service_Calendar($this->client);

        // Configurar Google Meet
        $conferenceSolutionKey = new Google_Service_Calendar_ConferenceSolutionKey();
        $conferenceSolutionKey->setType('hangoutsMeet');

        $conferenceRequest = new Google_Service_Calendar_CreateConferenceRequest();
        $conferenceRequest->setRequestId(uniqid());
        $conferenceRequest->setConferenceSolutionKey($conferenceSolutionKey);

        $conferenceData = new Google_Service_Calendar_ConferenceData();
        $conferenceData->setCreateRequest($conferenceRequest);

        // Crear el evento
        $event = new Google_Service_Calendar_Event([
            'summary'     => $summary,
            'description' => $description,
            'start'       => ['dateTime' => $startDateTime, 'timeZone' => 'America/New_York'],
            'end'         => ['dateTime' => $endDateTime, 'timeZone' => 'America/New_York'],
            'attendees'   => array_map(fn($email) => new Google_Service_Calendar_EventAttendee(['email' => $email]), $attendees),
            'conferenceData' => $conferenceData,
        ]);

        $calendarId = 'primary';
        $event = $service->events->insert($calendarId, $event, ['conferenceDataVersion' => 1]);

        return $event;
    }
}
