
from django.db.models import *
from django.db import transaction
from dev_sistema_escolar_api.serializers import *
from dev_sistema_escolar_api.models import *
from django.shortcuts import get_object_or_404
from rest_framework import permissions
from rest_framework import generics
from rest_framework.response import Response


class EventosAll(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def get(self, request, *args, **kwargs):
        #Obtener todos los eventos
        eventos = Eventos.objects.all().order_by("id")
        lista = EventoSerializer(eventos, many=True).data
        return Response(lista, 200)


class EventosView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    # Obtener evento por ID
    def get(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        evento = EventoSerializer(evento, many=False).data
        return Response(evento, 200)
    
    # Registrar nuevo evento
    @transaction.atomic
    def post(self, request, *args, **kwargs):
        data = request.data.copy()
        
        #Si no se envía responsable_id, usar el usuario actual
        if 'responsable_id' not in data or not data['responsable_id']:
            data['responsable_id'] = request.user.id
        
        evento_serializer = EventoSerializer(data=data)
        if evento_serializer.is_valid():
            evento = evento_serializer.save()
            return Response(EventoSerializer(evento).data, 201)
        return Response(evento_serializer.errors, 400)
    
    # Actualizar evento
    @transaction.atomic
    def put(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.data.get("id"))
        evento_serializer = EventoSerializer(evento, data=request.data, partial=True)
        if evento_serializer.is_valid():
            evento = evento_serializer.save()
            return Response(EventoSerializer(evento).data, 200)
        return Response(evento_serializer.errors, 400)
    
    # Eliminar evento
    @transaction.atomic
    def delete(self, request, *args, **kwargs):
        evento = get_object_or_404(Eventos, id=request.GET.get("id"))
        evento.delete()
        return Response({"message": "Evento eliminado correctamente"}, 200)