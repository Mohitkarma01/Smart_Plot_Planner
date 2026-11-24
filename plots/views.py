from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Plot, RoomRequirement
from .serializers import PlotSerializer, RoomRequirementSerializer




class PlotListCreateView(APIView):

    def get(self, request):

        plots = Plot.objects.all()

        serializer = PlotSerializer(
            plots,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = PlotSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save(user_id=1)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



# Room Requirement API


class RoomRequirementListCreateView(APIView):

    def get(self, request):

        requirements = RoomRequirement.objects.all()

        serializer = RoomRequirementSerializer(
            requirements,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = RoomRequirementSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# Generate House Layout


class GenerateLayoutView(APIView):

    def get(self, request, plot_id):

        try:

            plot = Plot.objects.get(
                id=plot_id
            )

            requirement = RoomRequirement.objects.get(
                plot=plot
            )

        except Plot.DoesNotExist:

            return Response(
                {
                    "error": "Plot not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )

        except RoomRequirement.DoesNotExist:

            return Response(
                {
                    "error": "Room requirements not found"
                },
                status=status.HTTP_404_NOT_FOUND
            )


        rooms = []

        plot_width = float(plot.width)
        plot_length = float(plot.length)

        current_y = 0



       
        # HELPER FUNCTION
      
      

        def add_room(
            room_type,
            name,
            x,
            y,
            width,
            length
        ):

            rooms.append({

                "type": room_type,

                "name": name,

                "x": round(x, 2),

                "y": round(y, 2),

                "width": round(width, 2),

                "length": round(length, 2)

            })



        
        # PARKING
       
       

        if requirement.parking:

            parking_width = plot_width

            parking_length = min(
                10,
                plot_length * 0.18
            )

            add_room(
                "Parking",
                "Parking",
                0,
                current_y,
                parking_width,
                parking_length
            )

            current_y += parking_length



        # GARDEN
     
     

        garden_length = 0

        if requirement.garden:

            garden_width = plot_width

            garden_length = min(
                8,
                plot_length * 0.12
            )

            add_room(
                "Garden",
                "Garden",
                0,
                plot_length - garden_length,
                garden_width,
                garden_length
            )



        # AVAILABLE AREA
    
    

        bottom_reserved = garden_length

        available_length = (
            plot_length
            - current_y
            - bottom_reserved
        )

        if available_length <= 0:

            available_length = plot_length - current_y



        
        # ROOM LIST
       
       

        room_list = []


        # Bedrooms

        for i in range(requirement.bedrooms):

            room_list.append(
                ("Bedroom", f"Bedroom {i + 1}")
            )


        # Halls

        for i in range(requirement.halls):

            room_list.append(
                ("Hall", f"Hall {i + 1}")
            )


        # Kitchens

        for i in range(requirement.kitchens):

            room_list.append(
                ("Kitchen", f"Kitchen {i + 1}")
            )


        # Bathrooms

        for i in range(requirement.bathrooms):

            room_list.append(
                ("Bathroom", f"Bathroom {i + 1}")
            )



       
        # CREATE ROOM GRID
       
       

        total_rooms = len(room_list)

        if total_rooms > 0:

            rows = []

            index = 0

            while index < total_rooms:

                remaining = total_rooms - index

                if remaining >= 2:

                    row_rooms = 2

                else:

                    row_rooms = 1

                rows.append(
                    room_list[
                        index:index + row_rooms
                    ]
                )

                index += row_rooms


            row_count = len(rows)

            row_height = (
                available_length / row_count
            )


            current_row_y = current_y


            for row in rows:

                column_width = (
                    plot_width / len(row)
                )


                for col_index, room in enumerate(row):

                    room_type = room[0]

                    room_name = room[1]

                    room_x = (
                        col_index
                        * column_width
                    )

                    add_room(

                        room_type,

                        room_name,

                        room_x,

                        current_row_y,

                        column_width,

                        row_height

                    )


                current_row_y += row_height



        # RESPONSE
      
      

        return Response({

            "plot": {

                "id": plot.id,

                "length": plot.length,

                "width": plot.width,

                "road_side": plot.road_side,

                "floors": plot.floors

            },

            "requirements": {

                "bedrooms":
                    requirement.bedrooms,

                "bathrooms":
                    requirement.bathrooms,

                "kitchens":
                    requirement.kitchens,

                "halls":
                    requirement.halls,

                "parking":
                    requirement.parking,

                "garden":
                    requirement.garden

            },

            "rooms": rooms

        })
