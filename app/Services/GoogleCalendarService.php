<?php

namespace App\Services;

use Google\Client;
use Google\Service\Calendar;
use Google\Service\Calendar\Event;
use Google\Service\Calendar\EventAttendee;
use Google\Service\Calendar\ConferenceData;
use Google\Service\Calendar\CreateConferenceRequest;
use Google\Service\Calendar\ConferenceSolutionKey;

class GoogleCalendarService
{
    protected $client;
    protected $calendar;

    public function __construct()
    {
        // Inicializar Google Client
        $this->client = new Client();
        $this->client->setAuthConfig(storage_path('app/google_credentials.json'));
        $this->client->setScopes(Calendar::CALENDAR_EVENTS);
        $this->client->setAccessType('offline');

        $this->calendar = new Calendar($this->client);
    }

    public function createEvent($summary, $description, $startDateTime, $endDateTime, $attendeesEmails)
    {
        // Configurar Google Meet
        $conferenceSolutionKey = new ConferenceSolutionKey();
        $conferenceSolutionKey->setType('hangoutsMeet');

        $conferenceRequest = new CreateConferenceRequest();
        $conferenceRequest->setRequestId(uniqid());
        $conferenceRequest->setConferenceSolutionKey($conferenceSolutionKey);

        $conferenceData = new ConferenceData();
        $conferenceData->setCreateRequest($conferenceRequest);

        // Crear evento
        $event = new Event([
            'summary'     => $summary,
            'description' => $description,
            'start'       => ['dateTime' => $startDateTime, 'timeZone' => 'America/New_York'],
            'end'         => ['dateTime' => $endDateTime, 'timeZone' => 'America/New_York'],
            'attendees'   => array_map(fn($email) => new EventAttendee(['email' => $email]), $attendeesEmails),
            'conferenceData' => $conferenceData,
        ]);

        // Insertar en Google Calendar
        $params = ['conferenceDataVersion' => 1];
        $calendarId = 'primary';
        $event = $this->calendar->events->insert($calendarId, $event, $params);

        return [
            'meet_link' => $event->getHangoutLink(),
            'event_id'  => $event->getId()
        ];
    }

    public function addAttendeeToEvent($eventId, $attendeeEmail)
    {
        $calendarId = 'primary';

        // Obtener el evento existente
        $event = $this->calendar->events->get($calendarId, $eventId);

        // Agregar nuevo asistente
        $attendees = $event->getAttendees();
        $attendees[] = new EventAttendee(['email' => $attendeeEmail]);
        $event->setAttendees($attendees);

        // Actualizar el evento en Google Calendar
        $updatedEvent = $this->calendar->events->update($calendarId, $eventId, $event);

        return $updatedEvent->getHangoutLink();
    }
}
