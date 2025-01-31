PGDMP  :                    |            scoter    16.3    16.3     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    16398    scoter    DATABASE     �   CREATE DATABASE scoter WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE scoter;
                postgres    false            �            1259    16407    scooter    TABLE     �   CREATE TABLE public.scooter (
    id integer NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    unique_name character varying(50) NOT NULL,
    battery_status integer NOT NULL
);
    DROP TABLE public.scooter;
       public         heap    postgres    false            �            1259    16406    scooter_id_seq    SEQUENCE     �   CREATE SEQUENCE public.scooter_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.scooter_id_seq;
       public          postgres    false    218            �           0    0    scooter_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.scooter_id_seq OWNED BY public.scooter.id;
          public          postgres    false    217            �            1259    16400    user    TABLE     �   CREATE TABLE public."user" (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    password character varying(100) NOT NULL,
    role character varying(20) NOT NULL
);
    DROP TABLE public."user";
       public         heap    postgres    false            �            1259    16399    user_id_seq    SEQUENCE     �   CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 "   DROP SEQUENCE public.user_id_seq;
       public          postgres    false    216            �           0    0    user_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;
          public          postgres    false    215                        2604    16410 
   scooter id    DEFAULT     h   ALTER TABLE ONLY public.scooter ALTER COLUMN id SET DEFAULT nextval('public.scooter_id_seq'::regclass);
 9   ALTER TABLE public.scooter ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    217    218    218                       2604    16403    user id    DEFAULT     d   ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);
 8   ALTER TABLE public."user" ALTER COLUMN id DROP DEFAULT;
       public          postgres    false    215    216    216            �          0    16407    scooter 
   TABLE DATA           W   COPY public.scooter (id, latitude, longitude, unique_name, battery_status) FROM stdin;
    public          postgres    false    218   $       �          0    16400    user 
   TABLE DATA           >   COPY public."user" (id, username, password, role) FROM stdin;
    public          postgres    false    216   �       �           0    0    scooter_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.scooter_id_seq', 12, true);
          public          postgres    false    217            �           0    0    user_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.user_id_seq', 12, true);
          public          postgres    false    215            $           2606    16412    scooter scooter_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.scooter
    ADD CONSTRAINT scooter_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.scooter DROP CONSTRAINT scooter_pkey;
       public            postgres    false    218            "           2606    16405    user user_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public."user" DROP CONSTRAINT user_pkey;
       public            postgres    false    216            �   �   x�E�1A��w��2� 簵3֛�5�bE��!,���H�a����y���En��^�A�ॅ�9�fRjj=��R��n�^��pB6�6
E��Em���I�1w����
.-씂��T�tY�%�Uw�Nh)����I�      �   y   x�m�I� �u{c�-ܨ4�8,P�R$1q��i)A�N?9��z��;*�-�M	�`���}�����X	�w�8�P���Ӣu8����&n������Z���uJ�w�|����"K     